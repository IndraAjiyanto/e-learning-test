import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kategori } from './kategori.entity';
import { Translation } from './translation.entity';

@Entity()
export class FlowCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kategori, (kategori) => kategori.flow_category, {
    onDelete: 'CASCADE',
  })
  kategori: Kategori;

  @OneToOne(() => Translation, (translation) => translation.flow_category)
  translation: Translation;
}
