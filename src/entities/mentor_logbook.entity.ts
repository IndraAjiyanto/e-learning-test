import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Session } from './session.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class MentorLogbook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  activity: string;

  @Column()
  activityDetail: string;

  @Column()
  documentation: string;

  @Column()
  obstacle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.mentor_logbook, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Session, (session) => session.logbookMentors, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;
}
