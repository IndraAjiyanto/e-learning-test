import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Kelas } from './kelas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  gambar: string[];

  @Column()
  judul: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  content_html: string;

  @Column()
  deskripsi: string;

  @Column()
  link: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.portfolio, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.portfolio, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;
}
