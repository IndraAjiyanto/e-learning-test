import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJenisKelaDto } from './dto/create-jenis_kela.dto';
import { UpdateJenisKelaDto } from './dto/update-jenis_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseType } from 'src/entities/course_type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseTypesService {
  constructor(
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
  ) {}
  async create(createJenisKelaDto: CreateJenisKelaDto) {
    const courseType =
      await this.courseTypeRepository.create(createJenisKelaDto);
    return await this.courseTypeRepository.save(courseType);
  }

  async findAll() {
    return await this.courseTypeRepository.find();
  }

  async findOne(jenis_kelasId: number) {
    const courseType = await this.courseTypeRepository.findOne({
      where: { id: jenis_kelasId },
    });
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return courseType;
  }

  async update(jenis_kelasId: number, updateJenisKelaDto: UpdateJenisKelaDto) {
    const courseType = await this.findOne(jenis_kelasId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    Object.assign(courseType, updateJenisKelaDto);
    return await this.courseTypeRepository.save(courseType);
  }

  async remove(jenis_kelasId: number) {
    const courseType = await this.findOne(jenis_kelasId);
    if (!courseType) {
      throw new NotFoundException('Program type not found');
    }
    return await this.courseTypeRepository.remove(courseType);
  }
}
