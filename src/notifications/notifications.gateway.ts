import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SocketWithUser } from './types';

interface NotifyPayload {
  type: string;
  skillName: string;
  fromUser: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/notifications' })
@UseGuards(WsJwtGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(NotificationsGateway.name);

  async handleConnection(client: SocketWithUser) {
    try {
      const user = client.data.user;
      if (!user || !user.id) {
        this.logger.warn(`Connection rejected: no user id in token`);
        client.disconnect();
        return;
      }

      client.join(user.id.toString());
      this.logger.log(`User connected: ${user.id}`);
    } catch (err) {
      this.logger.warn(`Error on connection: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: SocketWithUser) {
    const user = client.data.user;
    this.logger.log(`User disconnected: ${user?.id || 'unknown'}`);
  }

  notifyUser(userId: string, payload: NotifyPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
