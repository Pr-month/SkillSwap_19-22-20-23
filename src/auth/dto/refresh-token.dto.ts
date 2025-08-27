import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'sample_refresh_token' })
  @IsString()
  refreshToken: string;
}
