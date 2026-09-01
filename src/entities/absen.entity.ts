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
import { Exclude } from 'class-transformer';

export type Status =
  | 'permission'
  | 'present'
  | 'sick'
  | 'absent'
  | 'no_information';

@Entity()
export class Absen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @Exclude()
  user: User;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.absen, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan;
}
