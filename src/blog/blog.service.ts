import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { In, Not, Repository } from 'typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Topic } from 'src/entities/topic.entity';
import { User } from 'src/entities/user.entity';
import { Likes } from 'src/entities/likes.entity';
import { Coment } from 'src/entities/coment.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(KategoriBlog)
    private readonly kategoriBlogRepository: Repository<KategoriBlog>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Likes)
    private readonly likeRepository: Repository<Likes>,
    @InjectRepository(Coment)
    private readonly comentRepository: Repository<Coment>,
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

async getReply(comentId: string) {
  return await this.comentRepository.find({
    where: { replies: { id: comentId } },  // ← query by relasi
    relations: ['user'],                    // ← load user-nya sekalian
  });
}

async findBlogPaginated(params: {
  kategoriId?: string;
  search?: string;
  excludeIds?: number[];
  page: number;
  limit: number;
}) {
  const query = this.blogRepository.createQueryBuilder('blog')
    .leftJoinAndSelect('blog.kategori_blog', 'kategori_blog')
    .leftJoinAndSelect('blog.likes', 'likes')
    .leftJoinAndSelect('likes.user', 'user')
    .orderBy('blog.createdAt', 'DESC');

  // Exclude trending ids
  if (params.excludeIds && params.excludeIds.length > 0) {
    query.andWhere('blog.id NOT IN (:...excludeIds)', { excludeIds: params.excludeIds });
  }

  if (params.kategoriId) {
    query.andWhere('kategori_blog.id = :kategoriId', { kategoriId: params.kategoriId });
  }

  if (params.search) {
    query.andWhere(
      '(blog.judul ILIKE :search OR blog.description ILIKE :search)',
      { search: `%${params.search}%` }
    );
  }

  query.skip((params.page - 1) * params.limit).take(params.limit);

  const [data, total] = await query.getManyAndCount();
  return { data, total };
}

  async ChangeImageEditorJS(
    isi: string,
    oldFolder: string,
    newFolder: string,
    deleteFileInFolder?: string,
  ): Promise<string> {
    const editorjsData = JSON.parse(isi);

    const tempDir = path.join(process.cwd(), 'public' + oldFolder);
    const finalDir = path.join(process.cwd(), 'public' + newFolder);

    editorjsData.blocks.forEach((block: any) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const oldUrl = block.data.file.url;

        const fileName = oldUrl.split('/').pop();

        const oldPath = path.join(tempDir, fileName);
        const newPath = path.join(finalDir, fileName);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }

        block.data.file.url = `${newFolder}/${fileName}`;
      }
    });

    if (deleteFileInFolder) {
      const deleteDir = path.join(process.cwd(), 'public' + deleteFileInFolder);

      if (fs.existsSync(deleteDir)) {
        const files = fs.readdirSync(deleteDir);

        files.forEach((file) => {
          const filePath = path.join(deleteDir, file);

          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    return JSON.stringify(editorjsData);
  }

  async deleteFileTemp(folder: string) {
      const deleteDir = path.join(process.cwd(), 'public' + folder);

      if (fs.existsSync(deleteDir)) {
        const files = fs.readdirSync(deleteDir);

        files.forEach((file) => {
          const filePath = path.join(deleteDir, file);

          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
  }


  async ChangeImgPath(isi: string, newFolder: string): Promise<string> {
    const editorjsData = JSON.parse(isi);

    editorjsData.blocks.forEach((block: any) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const oldUrl = block.data.file.url;

        const filename = path.basename(oldUrl);

        block.data.file.url = `${newFolder}/${filename}`;
      }
    });

    return JSON.stringify(editorjsData);
  }

async findOne(id: string) {
  const blog = await this.blogRepository.findOne({
    where: { id },
    relations: [
      'kategori_blog',
      'topic',
      'likes',
      'coment',
      'coment.user',
      'coment.replies',        // ← tambah ini untuk cek parent
      'coment.children',
      'coment.children.user',
    ],
  });

  if (!blog) throw new NotFoundException('Blog not found');

  // Filter hanya komentar utama (yang tidak punya parent)
  blog.coment = blog.coment.filter(c => c.replies === null || c.replies === undefined);
  return blog;
}

async createReply(comentId: string, userId: string, blogId: string, content: string) {
  const coment = await this.comentRepository.findOne({ where: { id: comentId } });
  if (!coment) throw new NotFoundException('coment not found');

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('user not found');

  const blog = await this.blogRepository.findOne({ where: { id: blogId } });
  if (!blog) throw new NotFoundException('blog not found');

  const data = this.comentRepository.create({
    content: content,
    replies: coment,   // ← object, bukan coment.id
    user: user,
    blog: blog,
  });

  await this.comentRepository.save(data);
}

  async addComment(blogId: string, userId: string, content: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const comment = this.comentRepository.create({
      content,
      user,
      blog,
    });
    return await this.comentRepository.save(comment);
  }

  async incrementViews(id: string) {
    await this.blogRepository.increment({ id }, 'views', 1);
  }

  async incrementLikes(id: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const blog = await this.blogRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const like = await this.likeRepository.findOne({
      where: { user: {id : user.id}, blog: {id: blog.id} },
    });

    if (like) {
      await this.likeRepository.remove(like);
    } else {
      const data = await this.likeRepository.create({
        user: user,
        blog: blog,
      });
      await this.likeRepository.save(data);
    }
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

  async countLikes(blogId: string) {
    const count = await this.likeRepository.count({
      where: { blog: { id: blogId } },
    });
    return count;
  }

  async userLike(userId: string, blogId: string){
    const user = await this.userRepository.findOne({where: {id: userId}})
    if(!user){
      throw new NotFoundException("user not found");
    }

    const blog = await this.blogRepository.findOne({where : {id: blogId} })
    if(!blog){
      throw new NotFoundException("blog not found")
    }

    const like = await this.likeRepository.find({
      where: { user: {id : user.id}, blog: {id: blog.id} },
    });

    return like;
  }

  async getRecentBlogs(id: string) {
  const blog = await this.blogRepository.findOne({
    where: { id },
    relations: ['kategori_blog', 'topic'],
  });

  if (!blog) return [];

  const usedIds = [id];
  let results: any[] = [];

  const sameKategori = await this.blogRepository.find({
    where: {
      id: Not(In(usedIds)),
      kategori_blog: { id: blog.kategori_blog.id },
    },
    relations: ['kategori_blog', 'topic', 'likes', 'likes.user'],
    order: { createdAt: 'DESC' },
    take: 2,
  });

  results.push(...sameKategori);
  usedIds.push(...sameKategori.map(b => b.id));

  const sameTopic = await this.blogRepository.find({
    where: {
      id: Not(In(usedIds)),
      topic: { id: blog.topic.id },
    },
    relations: ['kategori_blog', 'topic', 'likes', 'likes.user'],
    order: { createdAt: 'DESC' },
    take: 1,
  });

  results.push(...sameTopic);
  usedIds.push(...sameTopic.map(b => b.id));

  if (results.length < 3) {
    const remaining = 3 - results.length;

    const filler = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.kategori_blog', 'kategori_blog')
      .leftJoinAndSelect('blog.topic', 'topic')
      .leftJoinAndSelect('blog.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'user')
      .where('blog.id NOT IN (:...ids)', { ids: usedIds })
      .orderBy('RANDOM()')
      .limit(remaining)
      .getMany();

    results.push(...filler);
  }

  return results;
}

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.promises.unlink(filePath);
    } catch (error) {}
  }

  async deleteUnusedImages(oldImage: string[], newImage: string[]) {
    const publicDir = path.join(process.cwd(), 'public');

    const fileToDelete = oldImage.filter(
      (oldPath) => !newImage.includes(oldPath),
    );

    await Promise.all(
      fileToDelete.map(async (dbPath) => {
        try {
          const fullPath = path.join(publicDir, dbPath);
          await fs.promises.unlink(fullPath);
        } catch (err) {}
      }),
    );

    return newImage;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
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
    if (updateBlogDto.isi_editorjs)
      blog.isi_editorjs = updateBlogDto.isi_editorjs;
    if (updateBlogDto.gambar) blog.gambar = updateBlogDto.gambar;
    if (updateBlogDto.author) blog.author = updateBlogDto.author;
    if (updateBlogDto.keyword) blog.keyword = updateBlogDto.keyword;
    if (updateBlogDto.description) blog.description = updateBlogDto.description;
    if (updateBlogDto.tags) blog.tags = updateBlogDto.tags;

    return await this.blogRepository.save(blog);
  }

  async editComment(comentId: string, content: string, userId: string){
    const coment = await this.comentRepository.findOne({where: {id: comentId}})
    if(!coment){
      throw new NotFoundException('coment not found')
    }

    const user = await this.userRepository.findOne({where: {id: userId}})
    if(!user){
      throw new NotFoundException('user not found')
    }

    await this.comentRepository.save({id: coment.id, content: content})
  }

  async remove(id: string) {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.blogRepository.remove(blog);
  }

  async deleteComment(id: string) {
    const comment = await this.comentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return await this.comentRepository.remove(comment);
  }
}
