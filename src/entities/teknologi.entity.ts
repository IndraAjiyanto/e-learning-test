import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { Mentor } from './mentor.entity';

@Entity()
export class Teknologi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ type: 'text' })
  svg: string;

  @ManyToMany(() => Kelas, (kelas) => kelas.teknologi)
  kelas: Kelas[];

  @ManyToMany(() => Mentor, (mentor) => mentor.teknologi)
  mentors: Mentor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
