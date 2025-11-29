import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

export type No = 1 | 2 | 3;

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  judul: string[];

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: [1, 2, 3] })
  no: No;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
