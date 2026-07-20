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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nama' })
  name: string;

  @Column('jsonb', { name: 'posisi', nullable: true })
  position: string[];

  @Column()
  linkedin: string;

  @ManyToMany(() => Technology, (teknologi) => teknologi.mentors, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'mentor_teknologi',
    joinColumn: { name: 'mentorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teknologiId', referencedColumnName: 'id' },
  })
  @Exclude()
  teknologi: Technology[];

  @Column()
  profile: string;

  @Column('jsonb', { name: 'deskripsi', nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.mentors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kelasId' })
  @Exclude()
  course: Course;
}
