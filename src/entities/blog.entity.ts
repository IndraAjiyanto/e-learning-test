import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KategoriBlog } from './kategori_blog.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column()
  isi: string;

  @Column('jsonb')
  gambar: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => KategoriBlog, (kategori_blog) => kategori_blog.blog, {
    onDelete: 'CASCADE',
  })
  kategori_blog: KategoriBlog;
}
