import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

@Entity()
export class Background {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  content: string[];

  @Column('jsonb')
  isi: string[];

  @Column()
  background_ke: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
