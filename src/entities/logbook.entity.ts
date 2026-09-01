import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Pertemuan } from './pertemuan.entity';
import { Exclude } from 'class-transformer';

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Logbook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kegiatan: string;

  @Column()
  rincian_kegiatan: string;

  @Column()
  dokumentasi: string;

  @Column({
    type: 'enum',
    enum: ['acc', 'proces', 'rejected'],
    default: 'rejected',
  })
  proses: Proses;

  @Column()
  kendala: string;

  @Column()
  dokumentasi_lain: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.logbook, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.logbook, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan;
}
