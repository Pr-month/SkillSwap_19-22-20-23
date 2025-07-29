import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { RequestStatus } from '../entities/request.entity';

export class UpdateRequestDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
