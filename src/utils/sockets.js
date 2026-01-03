// Node Imports.
import { createServer } from 'http';

// Lib Imports.
import { Server as SocketServer } from 'socket.io';

export default class Sockets {
  constructor(server) {
    this.httpServer = createServer(server);
    this.io = new SocketServer(this.httpServer);

    // Events.
    this.io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
}
