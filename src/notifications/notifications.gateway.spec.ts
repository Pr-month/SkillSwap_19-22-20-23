import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { SocketWithUser } from './types';
import { Server } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let mockServer: Server;
  let mockClient: SocketWithUser;
  let mockJwtGuard: WsJwtGuard;

  beforeEach(async () => {
    mockJwtGuard = {
      verifyToken: jest.fn(),
    } as unknown as jest.Mocked<WsJwtGuard>;
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: WsJwtGuard,
          useValue: mockJwtGuard,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer;
  });

  describe('handleConnection', () => {
    it('should connect the user and join their room', async () => {
      mockClient = {
        data: { user: { sub: 'user123' } },
        join: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as jest.Mocked<SocketWithUser>;

      const verifyTokenSpy = jest.spyOn(mockJwtGuard, 'verifyToken');
      const joinSpy = jest.spyOn(mockClient, 'join');

      await gateway.handleConnection(mockClient);

      expect(verifyTokenSpy).toHaveBeenCalledWith(mockClient);
      expect(joinSpy).toHaveBeenCalledWith('user123');
    });

    it('should disconnect the client if there is no user id in the token', async () => {
      mockClient = {
        data: { user: {} },
        disconnect: jest.fn(),
      } as unknown as jest.Mocked<SocketWithUser>;

      const disconnectSpy = jest.spyOn(mockClient, 'disconnect');

      await gateway.handleConnection(mockClient);

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should handle errors during connection', async () => {
      mockClient = {
        data: { user: { sub: 'user123' } },
        join: jest.fn().mockRejectedValue(new Error('Connection error')),
        disconnect: jest.fn(),
      } as unknown as jest.Mocked<SocketWithUser>;

      const disconnectSpy = jest.spyOn(mockClient, 'disconnect');

      await gateway.handleConnection(mockClient);

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log when a user disconnects', () => {
      mockClient = {
        data: { user: { sub: 'user123' } },
      } as unknown as jest.Mocked<SocketWithUser>;

      gateway.handleDisconnect(mockClient);
    });

    it('should log when an unknown user disconnects', () => {
      mockClient = {
        data: { user: {} },
      } as unknown as jest.Mocked<SocketWithUser>;

      gateway.handleDisconnect(mockClient);
    });
  });

  describe('notifyUser ', () => {
    it('should emit a notification to the specified user', () => {
      const payload = {
        type: 'NEW_REQUEST',
        skillName: 'JavaScript',
        fromUser: 'user456',
      };
      const toSpy = jest.spyOn(mockServer, 'to');
      const emitSpy = jest.spyOn(mockServer, 'emit');

      gateway.notifyUser('user123', payload);

      expect(toSpy).toHaveBeenCalledWith('user123');
      expect(emitSpy).toHaveBeenCalledWith('notificateNewRequest', payload);
    });
  });
});
