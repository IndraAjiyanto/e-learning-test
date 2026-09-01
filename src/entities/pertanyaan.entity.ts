import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Jawaban } from './jawaban.entity';
import { JawabanUser } from './jawaban_user.entity';
import { Quiz } from './quiz.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Pertanyaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pertanyaan_soal: string;

  @Column({ nullable: true })
  gambar?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.pertanyaan, { onDelete: 'CASCADE' })
  @Exclude()
  quiz: Quiz;

  @OneToMany(() => Jawaban, (jawaban) => jawaban.pertanyaan, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  jawaban: Jawaban[];

  @OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.pertanyaan, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  jawaban_user: JawabanUser[];
}
