import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

@Entity()
export class Tentang {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column()
  text: string;

  @Column()
  gambar: string;

      @OneToOne(() => Translation, (translation) => translation.tentang)
      translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
