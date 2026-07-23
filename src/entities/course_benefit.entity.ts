import { IsString } from 'class-validator';
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
export class ProgramBenefits {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  benefit: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @Column()
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.programBenefits, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  course: Course;
}
