import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Minggu } from './minggu.entity';

@Entity()
export class ProgresMinggu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  quiz: boolean;

  @Column({ default: false })
  proses: boolean;

  @ManyToOne(() => User, (user) => user.progres_minggu, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Minggu, (minggu) => minggu.progres_minggu, {
    onDelete: 'CASCADE',
  })
  minggu: Minggu;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
