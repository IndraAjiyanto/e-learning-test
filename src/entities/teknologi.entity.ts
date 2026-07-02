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
import { Exclude } from 'class-transformer';

@Entity()
export class Teknologi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ type: 'text', nullable: true })
  svg: string;

  @Column({ type: 'varchar', nullable: true })
  img_url: string;
  @ManyToMany(() => Kelas, (kelas) => kelas.teknologi)
  @Exclude()
  kelas: Kelas[];

  @ManyToMany(() => Mentor, (mentor) => mentor.teknologi)
  @Exclude()
  mentors: Mentor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
