import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Category } from './category.entity';
import { Exclude } from 'class-transformer';

@Entity('course_type')
export class CourseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  nameClassesType: string;

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  description: string[];

  @OneToMany(() => Course, (course) => course.courseType)
  @Exclude()
  classes: Course[];

  @ManyToMany(() => Category, (category) => category.courseTypes)
  @Exclude()
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
