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
import { Exclude } from 'class-transformer';

@Entity()
export class ProgresMinggu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  quiz: boolean;

  @Column({ default: false })
  proses: boolean;

  @ManyToOne(() => User, (user) => user.progres_minggu, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Minggu, (minggu) => minggu.progres_minggu, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  minggu: Minggu;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
