import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pertanyaan } from './pertanyaan.entity';
import { Nilai } from './nilai.entity';
import { Minggu } from './minggu.entity';
import { ProgresQuiz } from './progres_quiz.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nama_quiz: string;

  @Column()
  nilai_minimal: number;

  @Column({ type: 'int' })
  durasi: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Pertanyaan, (pertanyaan) => pertanyaan.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertanyaan: Pertanyaan[];

  @OneToMany(() => Nilai, (nilai) => nilai.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  nilai: Nilai[];

  @OneToMany(() => ProgresQuiz, (progres_quiz) => progres_quiz.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  progres_quiz: ProgresQuiz[];

  @ManyToOne(() => Minggu, (minggu) => minggu.quiz, { onDelete: 'CASCADE' })
  @Exclude()
  minggu: Minggu;
}
