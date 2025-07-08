import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { appConfig } from './config/app.config';
import { dbConfig } from './config/db.config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenStrategy } from './auth/strategies/accessToken.strategies';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AccessTokenStrategy],
  exports: [JwtModule],
})
export class AppModule {}
