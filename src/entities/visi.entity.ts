import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

@Entity('visi')
export class Visi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  visi: string;

  @OneToOne(() => Translation, (translation) => translation.visi)
  translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
