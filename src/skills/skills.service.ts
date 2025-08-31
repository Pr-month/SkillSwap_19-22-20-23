import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Role } from 'src/common/enums/user.enums';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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

  async findBySkill(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ data: Skill[]; page: number; totalPages: number }> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);
    const { search } = paginationQuery;

    const qb = this.skillsRepository.createQueryBuilder('skill');

    if (search) {
      qb.where('LOWER(skill.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [skills, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('skill.owner', 'owner')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    if (totalPages > 0 && page > totalPages) {
      throw new NotFoundException('Страница не найдена');
    }

    return {
      data: skills,
      page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['category', 'owner'],
    });
    return skill;
  }

  async create(
    createSkillDto: CreateSkillDto,
    ownerId: string,
  ): Promise<Skill> {
    const { categoryId, ...skillData } = createSkillDto;

    const owner = await this.usersRepository.findOneOrFail({
      where: { id: ownerId },
    });

    const category = await this.categoriesRepository.findOneOrFail({
      where: { id: categoryId },
    });

    const skill = this.skillsRepository.create({
      ...skillData,
      owner,
      category,
    });

    return this.skillsRepository.save(skill);
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    currentUserId: string,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['owner', 'category'],
    });
    // Проверяем владельца
    if (skill.owner.id !== currentUserId) {
      throw new ForbiddenException('Нет прав на обновление этого навыка');
    }

    const { categoryId, ...skillData } = updateSkillDto;

    if (categoryId) {
      const category = await this.categoriesRepository.findOneOrFail({
        where: { id: categoryId },
      });
      skill.category = category;
    }

    Object.assign(skill, skillData);

    return this.skillsRepository.save(skill);
  }

  async remove(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<void> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill с id ${id} не найден`);
    }

    // Проверка, что либо админ, либо владелец навыка
    if (skill.owner.id !== currentUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Нет прав на удаление этого навыка');
    }

    await this.skillsRepository.delete(id);
  }

  async addFavoriteSkill(
    userId: string,
    skillId: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    const skill = await this.skillsRepository.findOneByOrFail({ id: skillId });

    // Проверяем, что навык ещё не в избранном
    const isAlreadyFavorite = user.favoriteSkills.some(
      (s) => s.id === skill.id,
    );
    if (isAlreadyFavorite) {
      throw new ConflictException('Навык уже добавлен в избранное');
    }

    user.favoriteSkills.push(skill);

    await this.usersRepository.save(user);

    return { message: 'Навык успешно добавлен в избранное' };
  }

  // Удалить навык из избранного для пользователя
  async removeFavoriteSkill(
    userId: string,
    skillId: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    const index = user.favoriteSkills.findIndex((s) => s.id === skillId);
    if (index === -1) {
      throw new BadRequestException('Навык не найден в избранном');
    }

    user.favoriteSkills.splice(index, 1);

    await this.usersRepository.save(user);

    return { message: 'Навык успешно удалён из избранного' };
  }
}
