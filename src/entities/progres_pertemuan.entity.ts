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

@Entity()
export class ProgresPertemuan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  logbook: boolean;

  @Column({ default: false })
  absen: boolean;

  @ManyToOne(() => User, (user) => user.progres_pertemuan, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  user: User;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.progres_pertemuan, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
