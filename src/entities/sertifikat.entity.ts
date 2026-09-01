import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Sertifikat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sertif: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.sertifikat, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;
  @ManyToOne(() => User, (user) => user.sertifikat, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;
}
