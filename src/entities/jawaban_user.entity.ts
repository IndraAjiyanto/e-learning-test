import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pertanyaan } from './pertanyaan.entity';
import { User } from './user.entity';
import { Jawaban } from './jawaban.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class JawabanUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban_user, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  pertanyaan: Pertanyaan;

  @ManyToOne(() => Jawaban, (jawaban) => jawaban.jawaban_user, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @Exclude()
  jawaban: Jawaban | null;

  @ManyToOne(() => User, (user) => user.jawaban_user, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;
}
