import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { Not, Repository } from 'typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import * as fs from 'fs';
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

  async ChangeImageEditorJS(isi: string, oldFolder: string, newFolder: string, deleteFileInFolder?: string): Promise<string> {
const editorjsData = JSON.parse(isi);

const tempDir = path.join(process.cwd(), "public"+oldFolder);
const finalDir = path.join(process.cwd(), "public"+newFolder);

editorjsData.blocks.forEach((block: any) => {
  if (block.type === "image" && block.data?.file?.url) {
    const oldUrl = block.data.file.url;

      const fileName = oldUrl.split("/").pop();

      const oldPath = path.join(tempDir, fileName);
      const newPath = path.join(finalDir, fileName);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }

      block.data.file.url = `${newFolder}/${fileName}`;
  }
});

// if (deleteFileInFolder) {
//   const deleteDir = path.join(process.cwd(), "public" + deleteFileInFolder);

//   if (fs.existsSync(deleteDir)) {
//     const files = fs.readdirSync(deleteDir);

//     files.forEach(file => {
//       const filePath = path.join(deleteDir, file);

//       if (fs.lstatSync(filePath).isFile()) {
//         fs.unlinkSync(filePath);
//       }
//     });
//   }
// }

return JSON.stringify(editorjsData);
  }

async ChangeImgPath(isi: string, newFolder: string): Promise<string> {
  const editorjsData = JSON.parse(isi);

  editorjsData.blocks.forEach((block: any) => {
    if (block.type === "image" && block.data?.file?.url) {

      const oldUrl = block.data.file.url;

      const filename = path.basename(oldUrl);

      block.data.file.url = `${newFolder}/${filename}`;
    }
  });

  return JSON.stringify(editorjsData);
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
    
    await fs.promises.unlink(filePath);
  } catch (error) {
  }
}

async deleteUnusedImages(oldImage: string[], newImage: string[]) {
  const publicDir = path.join(process.cwd(), "public");

  const fileToDelete = oldImage.filter(
    (oldPath) => !newImage.includes(oldPath)
  );

  await Promise.all(
    fileToDelete.map(async (dbPath) => {
      try {
        const fullPath = path.join(publicDir, dbPath);
        await fs.promises.unlink(fullPath);

      } catch (err) {
      }
    })
  );

  return newImage;
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
    if (updateBlogDto.isi_editorjs) blog.isi_editorjs = updateBlogDto.isi_editorjs;
    if (updateBlogDto.gambar) blog.gambar = updateBlogDto.gambar;
    if (updateBlogDto.author) blog.author = updateBlogDto.author;
    if (updateBlogDto.keyword) blog.keyword = updateBlogDto.keyword;
    if (updateBlogDto.tags) blog.tags = updateBlogDto.tags;

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