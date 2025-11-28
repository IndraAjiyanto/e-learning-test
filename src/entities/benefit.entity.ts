import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

export type No = 1 | 2 | 3;

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column()
  text: string;

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: [1, 2, 3] })
  no: No;

  @OneToOne(() => Translation, (translation) => translation.benefit)
  translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
