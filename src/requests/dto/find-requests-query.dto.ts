import {
  IsOptional,
  IsEnum,
  IsBooleanString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../entities/request.entity';

export class FindRequestsQueryDto {
  @ApiPropertyOptional({
    enum: ['incoming', 'outgoing'],
    description: 'Тип запроса',
  })
  @IsOptional()
  @IsEnum(['incoming', 'outgoing'])
  type?: 'incoming' | 'outgoing';

  @ApiPropertyOptional({
    description: 'Прочитан ли запрос',
    type: String,
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  isRead?: string;

  @ApiPropertyOptional({ enum: RequestStatus, description: 'Статус запроса' })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
