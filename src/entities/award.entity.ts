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
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb',{nullable: true})
  content: string[];

  @Column('jsonb',{nullable: true})
  isi: string[];

  @Column()
  award_ke: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
