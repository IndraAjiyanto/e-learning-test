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

@Entity('faqs')
export class CategoryFaq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { nullable: true })
  question: string[];

  @Column('jsonb', { nullable: true })
  answer: string[];

  @ManyToOne(() => Category, (category) => category.faqs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  @Exclude()
  category?: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
