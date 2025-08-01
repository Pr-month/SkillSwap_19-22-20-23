import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Role } from '../common/enums/user.enums';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async create(
    senderId: string,
    createRequestDto: CreateRequestDto,
  ): Promise<Request> {
    const { offeredSkillId, requestedSkillId } = createRequestDto;

    // отправитель
    const sender = await this.usersRepository.findOneOrFail({
      where: { id: senderId },
      relations: ['skills'],
    });
    // навык отправителя
    const offeredSkill = await this.skillsRepository.findOneOrFail({
      where: { id: offeredSkillId },
      relations: ['owner'], // Владелец навыка
    });

    if (offeredSkill.owner.id !== senderId) {
      throw new ForbiddenException(
        'Вы не можете предлагать навык, которым не владеете',
      );
    }

    // запрашиваемый навык
    const requestedSkill = await this.skillsRepository.findOneOrFail({
      where: { id: requestedSkillId },
      relations: ['owner'],
    });

    const receiver = requestedSkill.owner;
    if (!receiver) {
      throw new NotFoundException(`Пользователь-получатель не найден`);
    }

    const request = this.requestsRepository.create({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
      isRead: false,
    });

    return this.requestsRepository.save(request);
  }

  async findAll(
    id: string,
    query: FindRequestsQueryDto,
  ): Promise<{ data: Request[]; page: number; totalPages: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    let isReadFilter: boolean | undefined;
    if (query.isRead !== undefined) {
      isReadFilter = query.isRead.toLowerCase() === 'true';
    }

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.sender', 'sender')
      .leftJoinAndSelect('request.receiver', 'receiver')
      .leftJoinAndSelect('request.offeredSkill', 'offeredSkill')
      .leftJoinAndSelect('request.requestedSkill', 'requestedSkill')
      .orderBy('request.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.type === 'incoming') {
      // текущий пользователь — получатель
      qb.where('receiver.id = :userId', { id });
    } else if (query.type === 'outgoing') {
      // текущий пользователь — отправитель
      qb.where('sender.id = :userId', { id });
    } else {
      // если type не задан, показываем все заявления с участием пользователя (sender или receiver)
      qb.where('(sender.id = :userId OR receiver.id = :userId)', { id });
    }

    if (isReadFilter !== undefined) {
      qb.andWhere('request.isRead = :isRead', { isRead: isReadFilter });
    }

    if (query.status) {
      qb.andWhere('request.status = :status', { status: query.status });
    }

    const [requests, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    // Если запрошенная страница больше, чем всего есть — можно вернуть пустой массив или выбросить NotFoundException
    if (totalPages > 0 && page > totalPages) {
      throw new NotFoundException('Страница не найдена');
    }

    return {
      data: requests,
      page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
    if (!request) {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }
    return request;
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    currentUserId: string,
  ): Promise<Request> {
    const request = await this.findById(id);

    if (
      request.sender.id !== currentUserId &&
      request.receiver.id !== currentUserId
    ) {
      throw new ForbiddenException('Нет прав на обновление этой заявки');
    }

    if (updateRequestDto.status !== undefined) {
      request.status = updateRequestDto.status;
      request.isRead = true;
    }
    if (updateRequestDto.isRead !== undefined) {
      request.isRead = updateRequestDto.isRead;
    }

    return this.requestsRepository.save(request);
  }

  async remove(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<void> {
    const request = await this.findById(id);
    if (request.sender.id !== currentUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Нет прав на удаление этой заявки');
    }
    await this.requestsRepository.remove(request);
  }
}
