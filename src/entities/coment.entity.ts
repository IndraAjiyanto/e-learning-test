import {
    Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Coment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.coment, {
    onDelete: 'CASCADE',
    nullable: true,
  })
    @Exclude()
    blog: Blog;

  @ManyToOne(() => User, (user) => user.coment, {
    onDelete: 'CASCADE',
  })
    @Exclude()
    user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
