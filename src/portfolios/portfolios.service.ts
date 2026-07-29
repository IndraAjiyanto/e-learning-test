import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portofolios } from 'src/entities/portofolios.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import * as ps from 'fs/promises';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
  ) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPortfolioDto.userId },
    });
    const course = await this.courseRepository.findOne({
      where: { id: createPortfolioDto.courseId },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!course) {
      throw new NotFoundException('course not found');
    }

    const portfolio = await this.portfolioRepository.create({
      ...createPortfolioDto,
      user: user,
      course: course,
    });

    return await this.portfolioRepository.save(portfolio);
  }

  async findByUser(userId: number) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: [
        'course',
        'course.category',
        'course.courseType',
        'course.technologies',
      ],
    });
  }

  async findCategory() {
    return await this.categoryRepository.find();
  }

  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findCategoryMyPortfolio(userId: number) {
    return await this.categoryRepository.find({where: { courses: { userCourses: { user: { id: userId } } } } });
  }

  async findMyPortfolioCourseTypes(userId: number) {
    return await this.courseTypeRepository.find({where: { classes: { userCourses: { user: { id: userId } } } } });
  }

  async findAll(
    page: number = 1,
    limit: number = 6,
    categoryId?: number,
    courseTypeId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.course', 'course')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.courseType', 'courseType');

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (courseTypeId) {
      queryBuilder.andWhere('courseType.id = :courseTypeId', { courseTypeId });
    }

    const total = await queryBuilder.getCount();

    const items = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('portfolio.createdAt', 'DESC')
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(portfolioId: number) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['course', 'course.technologies'],
    });
    if (!portfolio) {
      throw new NotFoundException('portfolio not found');
    }
    return portfolio;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await ps.unlink(filePath);
    } catch (error) {}
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

  async update(portfolioId: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.portfolioRepository.update(portfolioId, updatePortfolioDto);
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
          await ps.unlink(fullPath);
        } catch (err) {}
      }),
    );

    return newImage;
  }

  async remove(portfolioId: number) {
    const portfolio = await this.findOne(portfolioId);
    if (!portfolio) {
      throw new NotFoundException('Portfolios Not Found');
    }
    return await this.portfolioRepository.remove(portfolio);
  }
}
