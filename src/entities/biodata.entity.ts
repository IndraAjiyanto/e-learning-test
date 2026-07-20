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

export type Gender = 'Laki laki' | 'Perempuan';
export type Education =
  | 'SMP/Sederajat'
  | 'SMA/SMK/Sederajat'
  | 'Diploma(D3/D4)'
  | 'Sarjana(S1)';

@Entity()
export class Biodata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column()
  no: string;

  @Column()
  gender: Gender;

  @Column()
  city: string;

  @Column()
  education: Education;

  @Column()
  study_program: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.biodata)
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @Column()
  userId: number;
}
