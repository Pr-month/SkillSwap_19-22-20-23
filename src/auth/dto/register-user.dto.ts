import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/common/enums/user.enums';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  aboutMe?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsUrl()
  @IsOptional()
  avatar?: string;
}
