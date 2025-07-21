import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from 'src/users/dto/pagination-query.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto): Promise<Skill[]> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);
    return this.skillsRepository.find({
      relations: ['category', 'owner'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['category', 'owner'],
    });
    if (!skill) {
      throw new NotFoundException(`Skill с id ${id} не найден`);
    }
    return skill;
  }

  async create(skillData: Partial<Skill>): Promise<Skill> {
    const skill = this.skillsRepository.create(skillData);
    return this.skillsRepository.save(skill);
  }

  async update(id: string, skillData: Partial<Skill>): Promise<Skill> {
    await this.skillsRepository.update(id, skillData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.skillsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Skill с id ${id} не найден`);
    }
  }
}
