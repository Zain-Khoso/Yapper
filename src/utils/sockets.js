// Node Imports.
import { createServer } from 'http';

// Lib Imports.
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

// Local Imports.
import User from '../models/user.model.js';

export default class Sockets {
  constructor(server) {
    this.httpServer = createServer(server);
    this.io = new SocketServer(this.httpServer);

    // Attaching Middlewares.
    this.io.use(this.allowAuthenticatedUserOnly);

    // Events.
    this.io.on('connection', (socket) => {
      console.log('\nUser Connected: ', socket.id, socket.user.id, socket.user.email);

      socket.on('disconnect', () => {
        console.log('\nUser Disconnected: ', socket.id);
      });
    });
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
}
