// Local Imports.
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import sequelize from '../utils/database.js';
import { sanitizeText } from '../utils/sanitizers.js';
import {
  serializeMessage,
  serializeMessagesList,
  serializeResponse,
  serializeRoom,
} from '../utils/serializers.js';
import { schema_String } from '../utils/validations.js';
import { deleteOldImage } from '../utils/helpers.js';

// Constants.
const MESSAGES_PER_PAGE = 25;

async function createMessage(req, res, next) {
  const user = req.user;
  const roomId = req.params.roomId;

  // Working body date.
  let { content, isFile = false, fileName = null, fileType = null, fileSize = null } = req.body;
  content = sanitizeText(content);
  fileName = sanitizeText(fileName);

  const result = schema_String.safeParse(content);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { root: 'Empty Message.' }));
  }

  const t = await sequelize.transaction();

  try {
    const [chatroom] = await user.getRooms({
      attributes: ['id', 'lastMessageAt'],
      where: { id: roomId },
      joinTableAttributes: [],
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id'],
          through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
        },
      ],
    });
    if (!chatroom) {
      await t.rollback();
      return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    const sender = chatroom.members.find((member) => member.id === user.id).chatroomMember;
    const receiver = chatroom.members.find((member) => member.id !== user.id).chatroomMember;

    if (sender.isBlocked) {
      await t.rollback();
      return res.status(400).json(serializeResponse({}, { root: 'This user has blocked you.' }));
    }

    if (receiver.isBlocked) {
      await t.rollback();
      return res.status(400).json(serializeResponse({}, { root: 'You have blocked this user.' }));
    }

    const timestamp = new Date();

    const [message] = await Promise.all([
      chatroom.createMessage(
        { content, isFile, fileName, fileSize, fileType, userId: user.id, senderId: sender.id },
        { transaction: t }
      ),
      chatroom.update({ lastMessageAt: timestamp }, { transaction: t }),
      sender.update({ lastReadAt: timestamp }, { transaction: t }),
    ]);

    await t.commit();

    res.status(201).json(serializeResponse(serializeMessage(message, user.id)));
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function getChat(req, res) {
  const user = req.user;
  const roomId = req.params.roomId;
  const offset = parseInt(req.params.offset);

  const [chatroom] = await user.getRooms({
    attributes: ['id'],
    where: { id: roomId },
    joinTableAttributes: [],
    include: [
      {
        model: User,
        as: 'members',
        attributes: ['id'],
        through: { attributes: [] },
      },
      {
        model: Message,
        attributes: [
          'id',
          'isFile',
          'content',
          'fileType',
          'fileName',
          'fileSize',
          'userId',
          'senderId',
          'createdAt',
        ],
        order: [['createdAt', 'DESC']],
        separate: true,
        limit: MESSAGES_PER_PAGE,
        offset,
      },
    ],
  });
  if (!chatroom) {
    return res.status(200).json(
      serializeResponse({
        messages: [],
        offset,
        isFirstPage: offset === 0,
        isLastPage: true,
      })
    );
  }

  res.status(200).json(
    serializeResponse({
      messages: serializeMessagesList(chatroom.messages, user.id),
      offset: offset + chatroom.messages.length,
      isFirstPage: offset === 0,
      isLastPage: chatroom.messages.length < MESSAGES_PER_PAGE,
    })
  );
}

async function deleteMessage(req, res, next) {
  const user = req.user;
  const { roomId, messageId } = req.params;

  const t = await sequelize.transaction();

  try {
    const [chatroom] = await user.getRooms({
      where: { id: roomId },
      attributes: ['id', 'lastMessageAt', 'createdAt'],
      joinTableAttributes: [],
      include: [
        {
          model: Message,
          where: { id: messageId, userId: user.id },
        },
      ],
      transaction: t,
    });
    if (!chatroom || chatroom.messages.length === 0) {
      await t.rollback();

      return res.status(400).json(serializeResponse({}, { root: 'Invalid Request.' }));
    }

    const deletedMessage = await chatroom.messages.at(0).destroy({ transaction: t });
    if (deletedMessage.isFile) await deleteOldImage(deletedMessage.content);

    const [message] = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'DESC']],
      limit: 1,
      transaction: t,
    });

    const updatedChatroom = await chatroom.update(
      { lastMessageAt: message?.createdAt ?? chatroom.createdAt },
      { transaction: t }
    );
    updatedChatroom.messages.unshift(message);

    await t.commit();
    return res.status(200).json(serializeResponse(serializeRoom(updatedChatroom, user.id)));
  } catch (error) {
    await t.rollback();

    next(error);
  }

  res.status(200).json(serializeResponse(chatroom));
}

export { createMessage, getChat, deleteMessage };
