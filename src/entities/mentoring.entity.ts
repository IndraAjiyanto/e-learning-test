import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Kelas } from './kelas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Mentoring {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.mentoring, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.mentoring, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
