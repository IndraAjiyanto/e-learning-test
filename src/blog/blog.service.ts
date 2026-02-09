import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { Repository } from 'typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(KategoriBlog)
    private readonly kategoriBlogRepository: Repository<KategoriBlog>,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const kategori = await this.kategoriBlogRepository.findOne({
      where: { id: createBlogDto.kategori_blog },
    });
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    const blog = this.blogRepository.create({
      ...createBlogDto,
      kategori_blog: kategori,
    });
    return await this.blogRepository.save(blog);
  }

  async findAll() {
    return await this.blogRepository.find({
      relations: ['kategori_blog'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['kategori_blog'],
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

  async getRecentBlogs(limit: number = 5) {
    return await this.blogRepository.find({
      relations: ['kategori_blog'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPublicIdFromUrl(url: string) {
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    let path = parts[1];
    path = path.replace(/^v[0-9]+\/?/, '');
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path);
    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        console.log('File not found in Cloudinary.');
      } else {
        console.log('File deleted from Cloudinary:', result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
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
