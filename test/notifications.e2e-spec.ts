import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationsGateway } from '../src/notifications/notifications.gateway';
import { WsJwtGuard } from '../src/notifications/guards/ws-jwt.guard';
import { io, Socket } from 'socket.io-client';
import { Server } from 'http';
import { SocketWithUser } from '../src/notifications/types';

describe('NotificationsGateway (e2e)', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  let serverUrl: string;
  let clientSocketUser1: Socket;
  let clientSocketUser2: Socket;

  const testUser1 = { sub: 'user1', email: 'user1@example.com', role: 'user' };
  const testUser2 = { sub: 'user2', email: 'user2@example.com', role: 'user' };

  const user1Token = 'token-user1';
  const user2Token = 'token-user2';

  const mockVerifyToken = jest.fn((client: SocketWithUser) => {
    const token = client.handshake.query.token;
    if (token === user1Token) {
      client.data.user = testUser1;
    } else if (token === user2Token) {
      client.data.user = testUser2;
    }
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: WsJwtGuard,
          useValue: {
            verifyToken: mockVerifyToken,
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    gateway = moduleFixture.get<NotificationsGateway>(NotificationsGateway);

    await app.listen(0);
    const server = app.getHttpServer() as Server;
    const address = server.address();
    const port =
      typeof address === 'string'
        ? parseInt(address.split(':').pop()!)
        : address?.port;

    serverUrl = `http://localhost:${port}/notifications`;
  });

  afterAll(async () => {
    if (clientSocketUser1) {
      clientSocketUser1.disconnect();
    }
    if (clientSocketUser2) {
      clientSocketUser2.disconnect();
    }
    await app.close();
  });

  it('should connect user1 with valid token via query', (done) => {
    clientSocketUser1 = io(serverUrl, {
      query: {
        token: user1Token,
      },
      transports: ['websocket'],
    });

    clientSocketUser1.on('connect', () => {
      expect(clientSocketUser1.connected).toBeTruthy();
      done();
    });

    clientSocketUser1.on('connect_error', (err) => {
      done(err);
    });
  });

  it('should reject connection with invalid token', (done) => {
    const clientSocketInvalid = io(serverUrl, {
      query: {
        token: 'invalid-token',
      },
      transports: ['websocket'],
    });

    clientSocketInvalid.on('connect', () => {
      clientSocketInvalid.disconnect();
      done(new Error('Should not connect with an invalid token'));
    });

    clientSocketInvalid.on('connect_error', () => {
      done();
    });
  });

  it('should receive notification event on user2 socket', (done) => {
    clientSocketUser2 = io(serverUrl, {
      query: {
        token: user2Token,
      },
      transports: ['websocket'],
    });

    clientSocketUser2.on('connect', () => {
      const payload = {
        type: 'new_request',
        skillName: 'nestjs',
        fromUser: testUser1.sub,
      };

      clientSocketUser2.once('notificateNewRequest', (receivedPayload) => {
        try {
          expect(receivedPayload).toEqual(payload);
          done();
        } catch (err) {
          done(err);
        }
      });

      gateway.notifyUser(testUser2.sub, payload);
    });

    clientSocketUser2.on('connect_error', (err) => {
      done(err);
    });
  });
});
