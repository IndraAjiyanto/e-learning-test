import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('sertifikat')
export class Certificates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sertif' })
  certificate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.certificates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kelasId' })
  @Exclude()
  course: Course;
  @ManyToOne(() => User, (user) => user.certificates, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;
}
