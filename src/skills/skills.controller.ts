import {
  Controller,
  // Get,
  // Post,
  // Patch,
  // Delete,
  // Param,
  // Body,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
// import { Skill } from './entities/skill.entity';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}
}
