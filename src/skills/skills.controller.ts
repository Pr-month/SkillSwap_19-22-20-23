import {
  Controller,
  UseInterceptors,
  // Get,
  // Post,
  // Patch,
  // Delete,
  // Param,
  // Body,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UserPasswordFilter } from '../common/user-password.filter';
// import { Skill } from './entities/skill.entity';

@Controller('skills')
@UseInterceptors(UserPasswordFilter)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}
}
