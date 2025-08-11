import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UserPasswordFilter } from '../common/user-password.filter';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { AuthenticatedRequest } from 'src/auth/auth.types';

@Controller('skills')
@UseInterceptors(UserPasswordFilter)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.skillsService.findBySkill(paginationQuery);
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

  @UseGuards(AccessTokenGuard)
  @Post(':id/favorite')
  @HttpCode(200)
  addFavorite(@Param('id') skillId: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.addFavoriteSkill(req.user.sub, skillId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/favorite')
  removeFavorite(
    @Param('id') skillId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.removeFavoriteSkill(req.user.sub, skillId);
  }
}
