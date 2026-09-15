import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('daily_statistics')
@Unique(['statDate'])
export class DailyStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stat_date', type: 'date' })
  statDate: string;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

  @Column({ name: 'learning_count', type: 'int', default: 0 })
  learningCount: number;

  @Column({ name: 'participants_active_count', type: 'int', default: 0 })
  participantsActiveCount: number;

  @Column({ name: 'mentor_active_count', type: 'int', default: 0 })
  mentorActiveCount: number;

  @Column({ name: 'program_active_count', type: 'int', default: 0 })
  programActiveCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}