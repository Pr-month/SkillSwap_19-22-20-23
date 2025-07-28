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
  ForbiddenException,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request as RequestEntity } from './entities/request.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestEntity> {
    // Тут можно при необходимости сравнить req.user.sub и senderId, чтобы запретить создавать заявки от чужих аккаунтов
    if (createRequestDto.senderId !== req.user.sub) {
      throw new ForbiddenException(
        'Нельзя создавать заявку от имени другого пользователя',
      );
    }
    return this.requestsService.create(createRequestDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(): Promise<RequestEntity[]> {
    // Здесь можно расширить для фильтрации заявок конкретного пользователя, пагинации и т.д.
    return this.requestsService.findAll();
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
  ): Promise<RequestEntity> {
    return this.requestsService.update(id, updateRequestDto);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.requestsService.remove(id);
  }
}
