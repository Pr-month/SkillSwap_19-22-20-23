import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccessTokenStrategy } from './auth/strategies/accessToken.strategies';
import { appConfig } from './config/app.config';
import { IAppConfig } from './config/config.types';
import { dbConfig } from './config/db.config';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { WinstonLogger } from './logger/winston.logger';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [appConfig.KEY],
      useFactory: (configService: IAppConfig) => ({
        secret: configService.jwt.accessTokenSecret,
        signOptions: { expiresIn: configService.jwt.accessTokenExpiration },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [dbConfig.KEY],
      useFactory: (configService: IAppConfig) => {
        return {
          ...configService,
        };
      },
    }),
    UsersModule,
    AuthModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AccessTokenStrategy, WinstonLogger],
  exports: [JwtModule],
})
export class AppModule {}
