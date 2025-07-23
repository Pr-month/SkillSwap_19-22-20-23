import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PaginationQueryDto } from 'src/users/dto/pagination-query.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { AuthenticatedRequest } from 'src/auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.skillsService.findAll(paginationQuery);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.skillsService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() skillData: CreateSkillDto, @Req() req: AuthenticatedRequest) {
    return this.skillsService.create(skillData, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() skillData: CreateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, skillData, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
