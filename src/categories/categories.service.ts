import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { CategoryFaq } from 'src/entities/faqs.entity';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Superiority } from 'src/entities/superiority.entity';
import { Gallery } from 'src/entities/gallery.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(CategoryFaq)
    private readonly faqRepository: Repository<CategoryFaq>,
    @InjectRepository(BenefitCategory)
    private readonly benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(FlowCategory)
    private readonly flowCategoryRepository: Repository<FlowCategory>,
    @InjectRepository(Superiority)
    private readonly superiorityRepository: Repository<Superiority>,
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
  ) {}

  async create(createCategoriesDto: CreateCategoriesDto) {
    const { courseType: courseTypeIds, ...categoryData } = createCategoriesDto;
    const category = await this.categoryRepository.create(categoryData);

    if (courseTypeIds && courseTypeIds.length > 0) {
      const courseTypes =
        await this.courseTypeRepository.findByIds(courseTypeIds);
      category.courseTypes = courseTypes;
    }

    return await this.categoryRepository.save(category);
  }

  async findOneCategory(categoryName: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
      relations: ['courseTypes'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findCourseTypes() {
    return await this.courseTypeRepository.find();
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['courseTypes'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findCourseByCategory(categoryId: number) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId }, launch: true },
      relations: ['courseType', 'category', 'userCourses'],
    });
  }

  async findCourseByCategoryAll(categoryId: number) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId } },
      relations: ['courseType', 'category', 'userCourses'],
      order: { launch: 'DESC' },
    });
  }

  async findAlumniByCategory(categoryId: number) {
    return await this.alumniRepository.find({
      where: { course: { category: { id: categoryId } } },
      relations: ['course'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async findFaqByCategory(categoryId: number) {
    return await this.faqRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findSuperiorityByCategory(categoryId: number) {
    return await this.superiorityRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findBenefitByCategory(categoryId: number) {
    return await this.benefitCategoryRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findFlowByCategory(categoryId: number) {
    return await this.flowCategoryRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findGalleryByCategory(categoryId: number) {
    return await this.galleryRepository.find({
      where: { category: { id: categoryId } },
      order: { id: 'DESC' },
      take: 6,
    });
  }

  async update(categoryId: number, updateCategoriesDto: UpdateCategoriesDto) {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { courseType: courseTypeIds, ...updateData } = updateCategoriesDto;
    Object.assign(category, updateData);

    if (courseTypeIds !== undefined) {
      if (courseTypeIds.length > 0) {
        const courseTypes =
          await this.courseTypeRepository.findByIds(courseTypeIds);
        category.courseTypes = courseTypes;
      } else {
        category.courseTypes = [];
      }
    }

    return await this.categoryRepository.save(category);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async remove(categoryId: number) {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.remove(category);
    return { message: 'category successfully deleted' };
  }
}
