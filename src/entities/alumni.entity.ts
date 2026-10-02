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
import { ALUMNI_RATINGS, AlumniRating } from './types/alumni-rating';

@Entity()
export class Alumni {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  profile: string;

  @Column('jsonb', { nullable: true })
  name: string[];

  @Column('jsonb', { nullable: true })
  message: string[];

  @Column('jsonb', { nullable: true })
  currentPosition: string[];

  @Column({ type: 'enum', enum: ALUMNI_RATINGS, default: '5' })
  rating: AlumniRating;

  @ManyToOne(() => Course, (course) => course.alumni, { onDelete: 'CASCADE' })
  @Exclude()
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
