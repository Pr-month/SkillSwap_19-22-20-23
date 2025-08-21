import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request as RequestEntity } from './entities/request.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { Role } from '../common/enums/user.enums';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestEntity> {
    return this.requestsService.create(req.user.sub, createRequestDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(
    @Query() query: FindRequestsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ data: RequestEntity[]; page: number; totalPages: number }> {
    // Здесь можно расширить для фильтрации заявок конкретного пользователя, пагинации и т.д.
    return this.requestsService.findAll(req.user.sub, query);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RequestEntity> {
    return this.requestsService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestEntity> {
    return this.requestsService.update(id, updateRequestDto, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.requestsService.remove(id, req.user.sub, req.user.role as Role);
  }
}
