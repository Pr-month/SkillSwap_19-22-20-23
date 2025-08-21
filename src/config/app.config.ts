import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    accessTokenSecret: process.env.JWT_SECRET || 'supersecret',
    accessTokenExpiration: process.env.JWT_EXPIRATION || '3600s',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret',
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  },
  upload: {
    dir: './public',
    fileSizeMax: 2 * 1024 * 1024,
  },
}));
