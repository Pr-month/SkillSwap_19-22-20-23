import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategies';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStrategy],
})
export class AuthModule {}
