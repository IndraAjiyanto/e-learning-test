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
export class BiodataMentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role: string;

  @OneToOne(() => User, (user) => user.biodata_mentor)
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
