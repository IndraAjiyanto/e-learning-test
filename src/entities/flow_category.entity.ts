import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class FlowCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kategori, (kategori) => kategori.flow_category, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  kategori: Kategori;
}
