import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseType } from './course_type.entity';
import { CategoryFaq } from './faqs.entity';
import { BenefitCategory } from './benefit_category.entity';
import { FlowCategory } from './flow_category.entity';
import { Superiority } from './superiority.entity';
import { Exclude } from 'class-transformer';
import { Gallery } from './gallery.entity';

export type Type = 'Special Program' | 'Paid Program' | 'Free Program';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  description: string[];

  @Column({ nullable: true })
  contact: string;

  @Column('jsonb', { nullable: true })
  for: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_id: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_en: string[];

  @Column({ nullable: true, type: 'jsonb' })
  info_ja: string[];

  @Column({
    type: 'enum',
    enum: ['Special Program', 'Paid Program', 'Free Program'],
    nullable: true,
  })
  type: Type;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Course, (course) => course.category)
  @Exclude()
  courses: Course[];

  @OneToMany(
    () => CategoryFaq,
    (faq) => faq.category,
  )
  @Exclude()
  faqs: CategoryFaq[];

  @OneToMany(
    () => BenefitCategory,
    (benefit_category) => benefit_category.category,
  )
  @Exclude()
  benefit_category: BenefitCategory[];

  @OneToMany(() => FlowCategory, (flow_category) => flow_category.category)
  @Exclude()
  flow_category: FlowCategory[];

  @OneToMany(() => Superiority, (superiority) => superiority.category)
  @Exclude()
  superiority: Superiority[];

  @ManyToMany(() => CourseType, (courseType) => courseType.categories)
  @JoinTable()
  @Exclude()
  courseTypes: CourseType[];

   @OneToMany(() => Gallery, (gallery) => gallery.category)
  @Exclude()
  gallery: Gallery[];
}
