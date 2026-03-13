import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KategoriBlog } from './kategori_blog.entity';
import { Topic } from './topic.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column({ type: 'text' })
  isi: string;

  @Column({ type: 'text' })
  isi_editorjs: string;

  @Column()
  author: string;

  @Column('jsonb')
  tags: string[];

  @Column()
  keyword: string;

  @Column('jsonb')
  gambar: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => KategoriBlog, (kategori_blog) => kategori_blog.blog, {
    onDelete: 'CASCADE',
  })
  kategori_blog: KategoriBlog;

  @ManyToOne(() => Topic, (topic) => topic.blog, {
    onDelete: 'CASCADE',
  })
  topic: Topic;
}
