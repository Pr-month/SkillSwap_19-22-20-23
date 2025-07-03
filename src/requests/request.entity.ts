import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  sender: User;

  @ManyToOne(() => User, { nullable: false })
  receiver: User;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @ManyToOne(() => Skill, { nullable: false })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, { nullable: false })
  requestedSkill: Skill;

  @Column({ default: false })
  isRead: boolean;
}
