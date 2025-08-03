import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { SocketWithUser } from '../types';
import { JwtPayload } from 'src/auth/auth.types';

@Injectable()
export class WsJwtGuard {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(client: SocketWithUser): void {
    const token = client.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      throw new WsException('Token not provided');
    }

    try {
      const secret = process.env.JWT_SECRET || 'supersecret';
      const payload = jwt.verify(token, secret);

      client.data = client.data || ({} as any);
      client.data.user = payload as JwtPayload;
    } catch (e) {
      throw new WsException('Invalid token');
    }
  }
}
