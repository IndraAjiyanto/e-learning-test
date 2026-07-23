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

@Entity('flow_category')
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

  @ManyToOne(() => Category, (category) => category.flow_category, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  @Exclude()
  category: Category;
}
