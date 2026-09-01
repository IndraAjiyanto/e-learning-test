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
import { JawabanUser } from './jawaban_user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Jawaban {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jawaban: string;

  @Column({ default: false })
  jawaban_benar: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertanyaan: Pertanyaan;

  @OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.jawaban, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  jawaban_user: JawabanUser[];
}
