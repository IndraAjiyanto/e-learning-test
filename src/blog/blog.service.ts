import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { Not, Repository } from 'typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Topic } from 'src/entities/topic.entity';


@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(KategoriBlog)
    private readonly kategoriBlogRepository: Repository<KategoriBlog>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const kategori = await this.kategoriBlogRepository.findOne({
      where: { id: createBlogDto.kategori_blog },
    });
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    const topic = await this.topicRepository.findOne({
      where: { id: createBlogDto.topic },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    const blog = this.blogRepository.create({
      ...createBlogDto,
      kategori_blog: kategori,
      topic: topic,
    });
    return await this.blogRepository.save(blog);
  }

  async findAll() {
    return await this.blogRepository.find({
      relations: ['kategori_blog', 'topic'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['kategori_blog', 'topic'],
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async getAllCategories() {
    return await this.kategoriBlogRepository.find({
      order: { nama: 'ASC' },
    });
  }

  async getAllTopics() {
    return await this.topicRepository.find({
      order: { nama: 'ASC' },
    });
  }

  async getRecentBlogs(id: number) {
    return await this.blogRepository.find({
      where: { id: Not(id) },
      relations: ['kategori_blog', 'topic'],
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async deleteFile(url: string) {
  if (!url) return;

  try {
    const filePath = path.join(process.cwd(), 'public', url);
    
    await fs.unlink(filePath);
  } catch (error) {
    throw new NotFoundException('File not found');
  }
}

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.kategori_blog) {
      const kategori = await this.kategoriBlogRepository.findOne({
        where: { id: updateBlogDto.kategori_blog },
      });
      if (!kategori) {
        throw new NotFoundException('Category not found');
      }
      blog.kategori_blog = kategori;
    }

    if (updateBlogDto.topic) {
      const topic = await this.topicRepository.findOne({
        where: { id: updateBlogDto.topic },
      });
      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
      blog.topic = topic;
    }

    if (updateBlogDto.judul) blog.judul = updateBlogDto.judul;
    if (updateBlogDto.isi) blog.isi = updateBlogDto.isi;
    if (updateBlogDto.gambar) blog.gambar = updateBlogDto.gambar;
    if (updateBlogDto.author) blog.author = updateBlogDto.author;

    return await this.blogRepository.save(blog);
  }

  async remove(id: number) {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.blogRepository.remove(blog);
  }
}
