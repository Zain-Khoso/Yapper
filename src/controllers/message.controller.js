// Local Imports.
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import sequelize from '../utils/database.js';
import { sanitizeText } from '../utils/sanitizers.js';
import {
  serializeMessage,
  serializeMessagesList,
  serializeResponse,
} from '../utils/serializers.js';
import { schema_String } from '../utils/validations.js';

// Constants.
const MESSAGES_PER_PAGE = 25;

async function createMessage(req, res, next) {
  const user = req.user;
  const roomId = req.params.roomId;

  // Working body date.
  let { content, isFile = false } = req.body;
  content = sanitizeText(content);

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
        { content, isFile, userId: user.id, senderId: sender.id },
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

export { createMessage, getChat };
