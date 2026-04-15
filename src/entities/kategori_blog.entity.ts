import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class KategoriBlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  nama: string[];

  @Column()
  icon: string;

  @Column('jsonb', { nullable: true })
  deskripsi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Blog, (blog) => blog.kategori_blog, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  blog: Blog[];
}
