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
  // ArrayNotEmpty,
  IsUUID,
} from 'class-validator';
import { Role, Gender } from '../../common/enums/user.enums';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  skills?: string[]; // массив id навыков, которые создал пользователь

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  wantToLearn?: string[]; // массив id категорий навыков

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  favoriteSkills?: string[]; // массив id избранных навыков

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
