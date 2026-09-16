import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseTypeDto } from './dto/create-course_type.dto';
import { UpdateCourseTypeDto } from './dto/update-course_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseType } from 'src/entities/course_type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseTypesService {
  constructor(
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
  ) {}
  async create(createJenisKelaDto: CreateCourseTypeDto) {
    const courseType =
      await this.courseTypeRepository.create(createJenisKelaDto);
    return await this.courseTypeRepository.save(courseType);
  }

  async findAll() {
    return await this.courseTypeRepository.find();
  }

  // Sumber data tabel /type-program (client-side fetch), sejajar dengan
  // UsersService.findAllPaginated. `description` jsonb { id, en, ja } di-cast ke
  // text supaya pencarian mengenai ketiga bahasa sekaligus, tanpa perlu tahu tab
  // bahasa mana yang sedang aktif di UI.
  async findAllPaginated(params: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const query = this.courseTypeRepository
      .createQueryBuilder('course_type')
      .orderBy('course_type.createdAt', 'DESC');

    if (params.search) {
      query.where(
        '(course_type.nameClassesType ILIKE :search OR course_type.icon ILIKE :search OR CAST(course_type.description AS text) ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    query.skip((params.page - 1) * params.limit).take(params.limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(courseTypeId: string) {
    const courseType = await this.courseTypeRepository.findOne({
      where: { id: courseTypeId },
    });
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return courseType;
  }

  async update(courseTypeId: string, updateJenisKelaDto: UpdateCourseTypeDto) {
    const courseType = await this.findOne(courseTypeId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    Object.assign(courseType, updateJenisKelaDto);
    return await this.courseTypeRepository.save(courseType);
  }

  async remove(courseTypeId: string) {
    const courseType = await this.findOne(courseTypeId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return await this.courseTypeRepository.remove(courseType);
  }
}
