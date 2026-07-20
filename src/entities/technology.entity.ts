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

@Entity('teknologi')
export class Technology {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nama' })
  name: string;

  @Column({ type: 'text', nullable: true })
  svg: string | null;

  @Column({ type: 'varchar', nullable: true })
  img_url: string | null;
  @ManyToMany(() => Course, (course) => course.teknologi)
  @Exclude()
  course: Course[];

  @ManyToMany(() => Mentors, (mentor) => mentor.teknologi)
  @Exclude()
  mentors: Mentors[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
