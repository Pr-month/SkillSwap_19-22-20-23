import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../entities/request.entity';

export class UpdateRequestDto {
  @ApiPropertyOptional({ enum: RequestStatus, description: 'Статус запроса' })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ description: 'Отметка о прочтении' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
