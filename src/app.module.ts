import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { dbConfig } from './config/db.config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IAppConfig } from './config/config.types';

@Module({
  imports: [
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET || 'defaultSecretKey',
    //   signOptions: { expiresIn: '1h' },
    // }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [appConfig.KEY],
      useFactory: (configService: IAppConfig) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: configService.jwt.expiresIn },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [appConfig.KEY],
      useFactory: (configService: IAppConfig) => {
        return {
          ...configService,
        };
      },
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [JwtModule],
})
export class AppModule {}
