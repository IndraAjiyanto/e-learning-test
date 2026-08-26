import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Alumni {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column('jsonb', { nullable: true })
  name: string[];

  @Column('jsonb', { nullable: true })
  message: string[];

  @Column('jsonb', { nullable: true })
  currentPosition: string[];

  @ManyToOne(() => Course, (course) => course.alumni, { onDelete: 'CASCADE' })
  @Exclude()
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
