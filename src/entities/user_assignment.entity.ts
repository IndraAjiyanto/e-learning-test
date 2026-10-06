import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FinalAssignment } from './final_assignment.entity';
import { User } from './user.entity';
import { ProcessStatus } from './types/process-status';
import { Exclude } from 'class-transformer';

export interface CommentHistoryItem {
  id?: string;
  comment: string;
  status?: ProcessStatus;
  reviewerId?: string;
  reviewerName?: string;
  createdAt: string | Date;
}

@Entity('user_assignment')
export class UserAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'finalAssignmentId' })
  finalAssignmentId: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'process', 'rejected'],
    default: 'process',
  })
  status: ProcessStatus;

  @Column()
  filePath: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('jsonb', { default: () => "'[]'::jsonb" })
  commentHistory: CommentHistoryItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => FinalAssignment,
    (finalAssignment) => finalAssignment.userAssignments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'finalAssignmentId' })
  @Exclude()
  finalAssignment: FinalAssignment;

  @ManyToOne(() => User, (user) => user.userAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;
}

