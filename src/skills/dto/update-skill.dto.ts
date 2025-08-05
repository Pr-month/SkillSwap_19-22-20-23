import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateSkillDto {
  @IsNotEmpty({ message: 'Название навыка не может быть пустым' })
  @IsString({ message: 'Название навыка должно быть строкой' })
  @MaxLength(100, {
    message: 'Название навыка не может быть длиннее 100 символов',
  })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Описание навыка должно быть строкой' })
  @MaxLength(500, {
    message: 'Описание навыка не может быть длиннее 500 символов',
  })
  description?: string;

  @IsNotEmpty({ message: 'Категория навыка обязательна' })
  @IsUUID('4', { message: 'ID категории должен быть корректным UUID v4' })
  categoryId?: string;

  @IsOptional()
  @IsString({
    each: true,
    message: 'Каждый элемент в массиве images должен быть строкой',
  })
  images?: string[];
}
