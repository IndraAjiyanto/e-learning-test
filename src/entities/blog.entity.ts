import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KategoriBlog } from './kategori_blog.entity';
import { Topic } from './topic.entity';
import { Exclude } from 'class-transformer';
import { Likes } from './likes.entity';
import { Coment } from './coment.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column('jsonb')
  isi: string[];

  @Column('jsonb')
  isi_editorjs: string[];

  @Column()
  author: string;

  @Column('jsonb')
  tags: string[];

  @Column()
  keyword: string;

  @Column()
  description: string;

  @Column('jsonb')
  gambar: string[];

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Likes, (likes) => likes.blog)
  @Exclude()
  likes: Likes[];

    @OneToMany(() => Coment, (coment) => coment.blog)
    @Exclude()
    coment: Coment[];

  @ManyToOne(() => KategoriBlog, (kategori_blog) => kategori_blog.blog, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  kategori_blog: KategoriBlog;

  @ManyToOne(() => Topic, (topic) => topic.blog, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  topic: Topic;
}
