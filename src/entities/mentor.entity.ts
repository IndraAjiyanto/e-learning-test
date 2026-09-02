import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Technology } from './technology.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Mentors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column('jsonb', { name: 'position', nullable: true })
  position: string[];

  @Column()
  linkedin: string;

  @ManyToMany(() => Technology, (technologies) => technologies.mentors, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'mentor_technologies',
    joinColumn: { name: 'mentorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'technologiesId', referencedColumnName: 'id' },
  })
  @Exclude()
  technologies: Technology[];

  @Column()
  profile: string;

  @Column('jsonb', { name: 'description', nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.mentors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  @Exclude()
  course: Course;
}
