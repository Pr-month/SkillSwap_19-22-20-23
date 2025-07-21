import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from 'src/users/dto/pagination-query.dto';

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

  @Post()
  create(@Body() skillData: Partial<Skill>) {
    return this.skillsService.create(skillData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() skillData: Partial<Skill>) {
    return this.skillsService.update(id, skillData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
