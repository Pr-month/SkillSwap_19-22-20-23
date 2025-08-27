import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'Название навыка',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Название навыка не может быть пустым' })
  @IsString({ message: 'Название навыка должно быть строкой' })
  @MaxLength(100, {
    message: 'Название навыка не может быть длинее 100 символов',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Навык программирования на JavaScript',
    description: 'Описание навыка',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Описание навыка должно быть строкой' })
  @MaxLength(500, {
    message: 'Описание навыка не может быть длинее 500 символов',
  })
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID категории навыка (UUID v4)',
  })
  @IsNotEmpty({ message: 'Категория навыка обязательна' })
  @IsUUID('4', { message: 'ID категории должен быть корректным UUID v4' })
  categoryId: string;

  @ApiPropertyOptional({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Массив URL изображений навыка',
    type: [String],
  })
  @IsOptional()
  @IsString({
    each: true,
    message: 'Каждый элемент в массиве images должен быть строкой',
  })
  images?: string[];
}
