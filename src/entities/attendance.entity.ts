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
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['permission', 'present', 'sick', 'absent', 'no_information'],
    default: 'no_information',
  })
  status: Status;

  @Column()
  time_attendance: Date;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.attendance, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.attendance, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan;
}
