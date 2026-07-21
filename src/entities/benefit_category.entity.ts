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

@Entity('benefit_category')
export class BenefitCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.benefit_category, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  @Exclude()
  category: Category;
}
