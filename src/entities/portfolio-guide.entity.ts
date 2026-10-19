import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('portfolio_guides')
export class PortfolioGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { nullable: true })
  content: object | null;

  @OneToOne(() => Course, (course) => course.portfolioGuide, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
