// Node Imports.
import { createServer } from 'http';

// Lib Imports.
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

// Local Imports.
import User from '../models/user.model.js';
import { sanitizeText } from './sanitizers.js';
import { schema_String } from './validations.js';
import { serializeMessage, serializeResponse } from './serializers.js';
import sequelize from './database.js';

export default class Sockets {
  constructor(server) {
    this.httpServer = createServer(server);
    this.io = new SocketServer(this.httpServer);

    // Attaching Middlewares.
    this.io.use(this.allowAuthenticatedUserOnly);

    // Events.
    this.io.on('connection', this.onSocketConnect.bind(this));
  }

  async allowAuthenticatedUserOnly(socket, next) {
    const authHeader = socket.handshake.auth?.accessToken;
    if (!authHeader) return next(new Error('Authentication error: No token provided'));

    let decoded = null;
    const token = authHeader.split(' ').at(-1);

    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }

    const user = await User.scope('full').findByPk(decoded.userId);
    if (!user) return next(new Error('Authentication error: User not found'));

    socket.user = user;
    return next();
  }

  async onSocketConnect(socket) {
    const user = socket.user;
    if (!user) return;

    await user.update({ isOnline: true });

    socket.join(user.id);
    this.io.to(user.id).emit('user-presence', { userId: user.id, isOnline: true });

    // Socket specific events.
    socket.on('subscribe', (id) => socket.join(id));
    socket.on('new-message', (body) => this.onMessageCreation(socket, body));
    socket.on('disconnect', () => this.onSocketDisconnect(user));
  }

  async onSocketDisconnect(user) {
    await user.update({ isOnline: false });

    this.io.to(user.id).emit('user-presence', { userId: user.id, isOnline: false });
  }

  async onMessageCreation(socket, body) {
    const user = socket.user;

    // Working body date.
    let {
      content,
      isFile = false,
      fileName = null,
      fileType = null,
      fileSize = null,
      roomId,
    } = body;
    content = sanitizeText(content);
    fileName = sanitizeText(fileName);
    fileType = isFile ? (fileType?.split('/')?.at(-1)?.toUpperCase() ?? 'TXT') : null;

    const result = schema_String.safeParse(content);
    if (!result.success) {
      return socket.emit('new-message-error', {
        type: 'validation',
        message: 'Message cannot be empty.',
      });
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
        return socket.emit('new-message-error', { type: 'validation', message: 'Invalid Request' });
      }

      const sender = chatroom.members.find((member) => member.id === user.id).chatroomMember;
      const receiver = chatroom.members.find((member) => member.id !== user.id).chatroomMember;

      if (sender.isBlocked) {
        await t.rollback();
        return socket.emit('new-message-error', {
          type: 'validation',
          message: 'This user has blocked you.',
        });
      }

      if (receiver.isBlocked) {
        await t.rollback();
        return socket.emit('new-message-error', {
          type: 'validation',
          message: 'You have blocked this user.',
        });
      }

      // Paywall.
      if (user.plan !== 'gold') {
        const messagesCount = await chatroom.countMessages({
          where: { userId: user.id },
          transaction: t,
        });

        if (messagesCount >= 25) {
          await t.rollback();

          return socket.emit('new-message-error', {
            type: 'paywall',
            message: 'Message limit reached. Upgrade to Gold plan to send more messages.',
          });
        }
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

      this.io.to(chatroom.id).emit('new-message', chatroom.id, serializeMessage(message, user.id));
    } catch (error) {
      await t.rollback();

      return socket.emit('new-message-error', { type: 'server', message: 'Something went wrong.' });
    }
  }
}
