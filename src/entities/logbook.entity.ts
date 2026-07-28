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

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Logbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activity', nullable:true })
  activity: string;

  @Column({ name: 'activity_details', nullable:true })
  activityDetails: string;

  @Column({ type:'varchar', nullable: true })
  documentation?: string| null;

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  process: Proses;

  @Column({ name: 'obstacles', nullable:true })
  obstacles: string;

  @Column({ name: 'other_documentation', nullable:true })
  otherDocumentation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.logbook, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Session, (session) => session.logbooks, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;
}
