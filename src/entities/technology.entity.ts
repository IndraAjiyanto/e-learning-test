import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Mentors } from './mentor.entity';
import { Exclude } from 'class-transformer';

@Entity('technologies')
export class Technology {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  svg: string | null;

  @Column({ type: 'varchar', nullable: true })
  img_url: string | null;
  @ManyToMany(() => Course, (course) => course.technologies)
  @Exclude()
  course: Course[];

  @ManyToMany(() => Mentors, (mentor) => mentor.technologies)
  @Exclude()
  mentors: Mentors[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
