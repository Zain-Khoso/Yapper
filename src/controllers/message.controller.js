// Local Imports.
import User from '../models/user.model.js';
import sequelize from '../utils/database.js';
import { sanitizeText } from '../utils/sanitizers.js';
import { serializeMessage, serializeResponse } from '../utils/serializers.js';
import { schema_String } from '../utils/validations.js';

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

    res.status(201).json(serializeResponse(serializeMessage(message)));
  } catch (error) {
    t.rollback();

    next(error);
  }
}

export { createMessage };
