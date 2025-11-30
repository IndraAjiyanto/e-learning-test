import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

@Entity('visi')
export class Visi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  visi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
