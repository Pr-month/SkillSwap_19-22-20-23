import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/common/enums/user.enums';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ivan' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль минимум 6 символов',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Moscow' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 25, minimum: 0, maximum: 150 })
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ example: 'About me text' })
  @IsString()
  @IsOptional()
  aboutMe?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  wantToLearnIds?: string[];
}
