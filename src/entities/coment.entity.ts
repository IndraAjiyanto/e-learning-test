import {
    Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

// coment.entity.ts
@Entity()
export class Coment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  // Parent comment (null = komentar utama)
  @ManyToOne(() => Coment, (coment) => coment.children, { nullable: true, onDelete: 'CASCADE' })
  replies: Coment;

  // Daftar balasan dari komentar ini
  @OneToMany(() => Coment, (coment) => coment.replies)
  children: Coment[];

  @ManyToOne(() => Blog, (blog) => blog.coment, { onDelete: 'CASCADE', nullable: true })
  @Exclude()
  blog: Blog;

  @ManyToOne(() => User, (user) => user.coment, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
