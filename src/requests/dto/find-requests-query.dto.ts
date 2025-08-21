import {
  IsOptional,
  IsEnum,
  IsBooleanString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../entities/request.entity';

export class FindRequestsQueryDto {
  @IsOptional()
  @IsEnum(['incoming', 'outgoing'])
  type?: 'incoming' | 'outgoing';

  @IsOptional()
  @IsBooleanString()
  isRead?: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
