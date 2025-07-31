import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const secret = process.env.JWT_SECRET || 'supersecret';
      const payload = jwt.verify(token, secret);

      client.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
