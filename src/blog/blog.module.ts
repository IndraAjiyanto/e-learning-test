import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import { CommonModule } from 'src/common/common.module';
import { Topic } from 'src/entities/topic.entity';
import { User } from 'src/entities/user.entity';
import { Likes } from 'src/entities/likes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, KategoriBlog, Topic, User, Likes]),
    CommonModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
