// Local Imports.
import sequelize from '../utils/database.js';
import User from '../models/user.model.js';
import Chatroom from '../models/chatroom.model.js';
import ChatroomMember from '../models/chatroomMember.model.js';
import { schema_Email } from '../utils/validations.js';
import { sanitizeEmail } from '../utils/sanitizers.js';
import { serializeResponse, serializeRoom } from '../utils/serializers.js';

async function createChatroom(req, res, next) {
  const user = req.user;

  // Working body data.
  let receiverEmail = req.body.receiverEmail;
  receiverEmail = sanitizeEmail(receiverEmail);

  const result = schema_Email.safeParse(receiverEmail);
  if (!result.success || receiverEmail === user.email) {
    return res.status(409).json(serializeResponse({}, { receiverEmail: 'Invalid Email' }));
  }

  const t = await sequelize.transaction();

  try {
    const receiver = await User.findOne({ where: { email: receiverEmail } });
    if (!receiver) {
      await t.rollback();
      return res.status(409).json(serializeResponse({}, { receiverEmail: 'Invalid Email' }));
    }

    const [existingRoom] = await ChatroomMember.findAll({
      attributes: ['roomId'],
      where: {
        memberId: [receiver.id, user.id],
      },
      group: ['roomId'],
      having: sequelize.literal('COUNT(DISTINCT memberId) = 2'),
      transaction: t,
    });
    if (existingRoom) {
      await t.rollback();
      return res.status(200).json(serializeResponse({ id: existingRoom.id, exists: true }));
    }

    const newChatroom = await Chatroom.create({}, { transaction: t });
    await newChatroom.addMembers([receiver.id, user.id], { transaction: t });

    const chatroom = await Chatroom.findByPk(newChatroom.id, {
      attributes: ['id', 'lastMessageAt'],
      include: {
        model: User,
        as: 'members',
        through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
      },
      transaction: t,
    });

    await t.commit();
    res.status(201).json(serializeResponse(serializeRoom(chatroom, user.id)));
  } catch (error) {
    t.rollback();
    next(error);
  }
}

export { createChatroom };
