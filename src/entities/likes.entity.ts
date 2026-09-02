import {
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
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Blog, (blog) => blog.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
    @Exclude()
    blog: Blog;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: 'CASCADE',
  })
    @Exclude()
    user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
