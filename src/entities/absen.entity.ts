import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Pertemuan } from './pertemuan.entity';

export type Status =
  | 'permission'
  | 'present'
  | 'sick'
  | 'absent'
  | 'no_information';

@Entity()
export class Absen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['permission', 'present', 'sick', 'absent', 'no_information'],
    default: 'no_information',
  })
  status: Status;

  @Column()
  waktu_absen: Date;

  @Column()
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.absen, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.absen, {
    onDelete: 'CASCADE',
  })
  pertemuan: Pertemuan;
}
