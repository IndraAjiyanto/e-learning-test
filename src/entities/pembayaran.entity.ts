import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Kelas } from './kelas.entity';
import { Cicilan } from './cicilan.entity';
import { Exclude } from 'class-transformer';

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Pembayaran {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  file: string;

  @Column({ nullable: true })
  no: string;

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  proses: Proses;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pembayaran, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.pembayaran, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;

  @OneToOne(() => Cicilan, (cicilan) => cicilan.pembayaran)
  @JoinColumn()
  @Exclude()
  cicilan: Cicilan;
}
