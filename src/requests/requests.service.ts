import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,

    private readonly notificationsGateway: NotificationsGateway, // внедряем шлюз
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const {
      senderId,
      receiverId,
      offeredSkillId,
      requestedSkillId,
      status = RequestStatus.PENDING,
      isRead = false,
    } = createRequestDto;

    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(
        `Пользователь-отправитель с ID ${senderId} не найден`,
      );
    }

    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(
        `Пользователь-получатель с ID ${receiverId} не найден`,
      );
    }

    const offeredSkill = await this.skillsRepository.findOne({
      where: { id: offeredSkillId },
    });
    if (!offeredSkill) {
      throw new NotFoundException(
        `Навык, предлагаемый отправителем, не найден`,
      );
    }

    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: requestedSkillId },
    });
    if (!requestedSkill) {
      throw new NotFoundException(
        `Навык, запрашиваемый у получателя, не найден`,
      );
    }

    const request = this.requestsRepository.create({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
      status,
      isRead,
    });

    const savedRequest = await this.requestsRepository.save(request);

    // Отправляем уведомление владельцу навыка (receiver)
    this.notificationsGateway.notifyUser(receiver.id.toString(), {
      type: 'new_request',
      skillName: requestedSkill.name,
      fromUser: sender.name,
    });

    return savedRequest;
  }

  async findAll(): Promise<Request[]> {
    return this.requestsRepository.find({
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
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
  ): Promise<Request> {
    const request = await this.findById(id);

    if (updateRequestDto.status !== undefined) {
      const oldStatus = request.status;
      request.status = updateRequestDto.status;

      if (oldStatus !== updateRequestDto.status) {
        const requesterId = request.sender.id.toString();
        const skillName = request.requestedSkill.name;
        const skillOwnerName = request.receiver.name;

        if (updateRequestDto.status === RequestStatus.REJECTED) {
          this.notificationsGateway.notifyUser(requesterId, {
            type: 'request_rejected',
            skillName,
            fromUser: skillOwnerName,
          });
        } else if (updateRequestDto.status === RequestStatus.ACCEPTED) {
          this.notificationsGateway.notifyUser(requesterId, {
            type: 'request_accepted',
            skillName,
            fromUser: skillOwnerName,
          });
        }
      }
    }

    if (updateRequestDto.isRead !== undefined) {
      request.isRead = updateRequestDto.isRead;
    }

    return this.requestsRepository.save(request);
  }

  async remove(id: string): Promise<void> {
    const request = await this.findById(id);
    await this.requestsRepository.remove(request);
  }
}
