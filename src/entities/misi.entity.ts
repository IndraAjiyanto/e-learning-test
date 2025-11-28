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
export class Misi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  misi_ke: number

  @Column()
  content: string;

  @Column()
  isi: string;

  @OneToOne(() => Translation, (translation) => translation.misi)
  translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
