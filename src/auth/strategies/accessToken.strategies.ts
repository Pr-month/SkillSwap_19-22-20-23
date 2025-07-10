import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IConfig } from 'src/config/config.types';
import { JwtPayload } from '../auth.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: IConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwt.accessTokenSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
