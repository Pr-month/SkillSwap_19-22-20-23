import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsUrl,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Gender } from '../../common/enums/user.enums';

export class CreateUserDto {
  @ApiProperty({ example: 'Ivan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 25, minimum: 0, maximum: 150 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ example: 'Moscow' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Пол пользователя' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'О себе текст' })
  @IsString()
  @IsOptional()
  aboutMe?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Роль пользователя' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'refresh_token_example' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  wantToLearn?: string[]; // ids, которые приходят от клиента
}
