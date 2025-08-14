import { WsJwtGuard } from './ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { appConfig } from '../../config/app.config';
import { SocketWithUser } from '../types';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: JwtService;

  const mockConfig = appConfig();

  beforeEach(() => {
    jwtService = new JwtService({});
    guard = new WsJwtGuard(jwtService, mockConfig);
  });

  it('should throw WsException if token is not provided', () => {
    const client = {
      handshake: {
        query: {},
      },
    } as unknown as jest.Mocked<SocketWithUser>;

    expect(() => guard.verifyToken(client)).toThrow(WsException);
    expect(() => guard.verifyToken(client)).toThrow('Token not provided');
  });

  it('should throw WsException if token is invalid', () => {
    const client = {
      handshake: {
        query: { token: 'invalid-token' },
      },
    } as unknown as jest.Mocked<SocketWithUser>;

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    expect(() => guard.verifyToken(client)).toThrow(WsException);
    expect(() => guard.verifyToken(client)).toThrow(/Invalid token/);
  });

  it('should assign user payload to client.data.user if token is valid', () => {
    const userPayload = { userId: '123', username: 'testuser' };
    const client = {
      handshake: {
        query: { token: 'valid-token' },
      },
      data: {},
    } as unknown as jest.Mocked<SocketWithUser>;

    jest.spyOn(jwtService, 'verify').mockImplementation(() => userPayload);

    guard.verifyToken(client);

    expect(client.data.user).toEqual(userPayload);
  });
});
