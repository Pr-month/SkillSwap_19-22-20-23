import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SocketWithUser } from './types';

interface NotifyPayload {
  type: string;
  skillName: string;
  fromUser: string;
}

const NOTIFICATIONS_PORT = Number(process.env.PORT) || 3000;

@WebSocketGateway(NOTIFICATIONS_PORT, {
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtGuard: WsJwtGuard) {}

  async handleConnection(client: SocketWithUser) {
    try {
      this.jwtGuard.verifyToken(client);
      const user = client.data.user;
      if (!user || !user.sub) {
        this.logger.warn(`Connection rejected: no user id in token`);
        client.disconnect();
        return;
      }

      client.join(user.sub.toString());
      this.logger.log(`User connected: ${user.sub}`);
    } catch (err) {
      this.logger.warn(`Error on connection: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: SocketWithUser) {
    const user = client.data.user;
    this.logger.log(`User disconnected: ${user?.sub || 'unknown'}`);
  }

  notifyUser(userId: string, payload: NotifyPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
