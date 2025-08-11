import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationsGateway } from '../src/notifications/notifications.gateway';
import { WsJwtGuard } from '../src/notifications/guards/ws-jwt.guard';
import { io, Socket } from 'socket.io-client';

describe('NotificationsGateway (e2e)', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  let jwtGuard: WsJwtGuard;
  let serverUrl: string;
  let clientSocket: Socket;

  const mockUser = { sub: '123' };
  const mockVerifyToken = jest.fn((client) => {
    client.data.user = mockUser;
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
    jwtGuard = moduleFixture.get<WsJwtGuard>(WsJwtGuard);

    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? parseInt(address.split(':').pop()!) : address?.port;
    if (port === undefined) {
      throw new Error('Could not determine the port');
    }
    serverUrl = `http://localhost:${port}/notifications`;
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await app.close();
  });

  it('should connect with valid token', (done) => {
    clientSocket = io(serverUrl, {
      auth: {
        token: 'valid-token',
      },
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBeTruthy();
      done();
    });

    clientSocket.on('connect_error', (err) => {
      done(err);
    });
  });

  it('should reject connection without user in token', (done) => {
    mockVerifyToken.mockImplementationOnce((client) => { });

    clientSocket = io(serverUrl, {
      auth: {
        token: 'invalid-token',
      },
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      done(new Error('Should not connect'));
    });

    clientSocket.on('connect_error', () => {
      done();
    });
  });

  it('should receive notification event', (done) => {
    clientSocket = io(serverUrl, {
      auth: {
        token: 'valid-token',
      },
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      const payload = {
        type: 'new_request',
        skillName: 'nestjs',
        fromUser: 'user456',
      };
      gateway.notifyUser(mockUser.sub, payload);
    });

    clientSocket.on('notificateNewRequest', (payload) => {
      expect(payload).toEqual({
        type: 'new_request',
        skillName: 'nestjs',
        fromUser: 'user456',
      });
      done();
    });

    clientSocket.on('connect_error', (err) => {
      done(err);
    });
  });
});
