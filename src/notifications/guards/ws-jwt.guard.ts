import { Injectable, Inject } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { SocketWithUser } from '../types';
import { JwtPayload } from 'src/auth/auth.types';
import { appConfig } from 'src/config/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class WsJwtGuard {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  verifyToken(client: SocketWithUser): void {
    const token = client.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      throw new WsException('Token not provided');
    }

    try {
      const secret = this.config.jwt.accessTokenSecret;
      const payload = jwt.verify(token, secret);

      client.data = client.data || ({} as any);
      client.data.user = payload as JwtPayload;
    } catch (e) {
      throw new WsException(`Invalid token ${e}`);
    }
  }
}
