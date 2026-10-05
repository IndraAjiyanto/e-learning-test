import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { UserAssignment } from './user_assignment.entity';
import { Exclude } from 'class-transformer';

@Entity('final_assignment')
export class FinalAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('jsonb', { nullable: true })
  content: object;

  @Column({ name: 'courseId', unique: true })
  courseId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Course, (course) => course.finalAssignment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  @Exclude()
  course: Course;

  @OneToMany(
    () => UserAssignment,
    (userAssignment) => userAssignment.finalAssignment,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @Exclude()
  userAssignments: UserAssignment[];
}

