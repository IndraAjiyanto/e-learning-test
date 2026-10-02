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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column()
  no: string;

  @Column({ nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  education: Education;

  @Column({ nullable: true })
  studyProgram: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.biodata)
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @Column()
  userId: string;
}
