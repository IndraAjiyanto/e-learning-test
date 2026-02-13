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
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column()
  icon: string;

  @Column()
  deskripsi: string;

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
