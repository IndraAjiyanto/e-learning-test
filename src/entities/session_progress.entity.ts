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

@Entity('session_progresses')
export class SessionProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  logbook: boolean;

  @Column({ default: false })
  isAttended: boolean;

  @ManyToOne(() => User, (user) => user.sessionProgress, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  user: User;

  @ManyToOne(() => Session, (session) => session.sessionProgress, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
