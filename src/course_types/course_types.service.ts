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

  async findOne(courseTypeId: number) {
    const courseType = await this.courseTypeRepository.findOne({
      where: { id: courseTypeId },
    });
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return courseType;
  }

  async update(courseTypeId: number, updateJenisKelaDto: UpdateCourseTypeDto) {
    const courseType = await this.findOne(courseTypeId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    Object.assign(courseType, updateJenisKelaDto);
    return await this.courseTypeRepository.save(courseType);
  }

  async remove(courseTypeId: number) {
    const courseType = await this.findOne(courseTypeId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return await this.courseTypeRepository.remove(courseType);
  }
}
