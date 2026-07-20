import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Portofolios {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { name: 'gambar' })
  image: string[];

  @Column({ name: 'judul' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  content_html: string;

  @Column({ name: 'deskripsi' })
  description: string;

  @Column()
  link: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.portfolio, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Course, (course) => course.portofolios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kelasId' })
  @Exclude()
  course: Course;
}
