import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class MentorBiodata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @OneToOne(() => User, (user) => user.mentor_biodata)
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
