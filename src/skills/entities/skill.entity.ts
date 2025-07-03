import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  // ManyToMany,
  // JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.skills, { nullable: false })
  category: Category;

  @Column('text', { array: true, default: [] })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills, { nullable: false })
  owner: User;
}
