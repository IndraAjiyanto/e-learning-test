import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pertemuan } from './pertemuan.entity';
import { Kelas } from './kelas.entity';
import { Quiz } from './quiz.entity';
import { ProgresMinggu } from './progres_minggu.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Minggu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  minggu_ke: number;

  @Column()
  keterangan: string;

  @Column({ default: false })
  akhir: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Pertemuan, (pertemuan) => pertemuan.minggu, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertemuan: Pertemuan[];

  @OneToMany(() => ProgresMinggu, (progres_minggu) => progres_minggu.minggu, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  progres_minggu: ProgresMinggu[];

  @OneToMany(() => Quiz, (quiz) => quiz.minggu, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  quiz: Quiz[];

  @ManyToOne(() => Kelas, (kelas) => kelas.minggu, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;
}
