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

  @Column({type: 'text'})
  isi: string;

  @Column()
  author: string;

  // @Column({type: 'text'})
  // tags: string;

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

  @ManyToOne(() => Topic, (topic) => topic.blog, {
    onDelete: 'CASCADE',
  })
  topic: Topic;
}
