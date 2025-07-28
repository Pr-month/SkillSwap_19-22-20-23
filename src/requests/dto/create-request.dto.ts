import { IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { RequestStatus } from '../entities/request.entity';

export class CreateRequestDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsUUID()
  offeredSkillId: string;

  @IsUUID()
  requestedSkillId: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus; // Обычно создается с дефолтным статусом PENDING

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
