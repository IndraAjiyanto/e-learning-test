import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Exclude } from 'class-transformer';

@Entity('superiority')
export class Superiority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.superiority, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kategoriId' })
  @Exclude()
  category: Category;
}
