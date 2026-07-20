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
export class LogbookMentor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activity: string;

  @Column()
  activity_detail: string;

  @Column()
  documentation: string;

  @Column()
  obstacle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.logbook_mentor, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Session, (session) => session.logbookMentors, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;
}
