import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlurKelaDto } from './dto/create-alur_kela.dto';
import { UpdateAlurKelaDto } from './dto/update-alur_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class CourseFlowsService {
  constructor(
    @InjectRepository(CourseFlow)
    private readonly alurKelasRepository: Repository<CourseFlow>,
    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
  ) {}

  async create(createAlurKelaDto: CreateAlurKelaDto) {
    const course = await this.kelasRepository.findOne({
      where: { id: createAlurKelaDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const finalFlow = await this.findAlurKelas(createAlurKelaDto.courseId);
    createAlurKelaDto.sequence = finalFlow + 1;

    const courseFlow = this.alurKelasRepository.create({
      ...createAlurKelaDto,
      course: course,
    });
    return await this.alurKelasRepository.save(courseFlow);
  }

  async noAlur(courseId: number) {
    const finalFlow = await this.findAlurKelas(courseId);
    const startFlow = finalFlow + 1;
    return startFlow;
  }

  async findAlurKelas(courseId: number) {
    const course_flows = await this.alurKelasRepository.findOne({
      where: { course: { id: courseId } },
      order: { sequence: 'DESC' },
    });
    if (!course_flows) {
      return 0;
    }
    return course_flows.sequence;
  }

  async findAll() {
    const course_flows = await this.alurKelasRepository.find({
      relations: ['course'],
      order: { course: { id: 'ASC' }, sequence: 'ASC' },
    });
    return course_flows;
  }

  async findAllKelas() {
    const course = await this.kelasRepository.find({
      order: { id: 'ASC' },
    });
    return course;
  }

  async findOne(alurKelasId: number) {
    const course_flows = await this.alurKelasRepository.findOne({
      where: { id: alurKelasId },
      relations: ['course'],
    });
    if (!course_flows) {
      throw new NotFoundException('Flow Program not found');
    }
    return course_flows;
  }

  async update(alurKelasId: number, updateAlurKelaDto: UpdateAlurKelaDto) {
    const courseFlow = await this.findOne(alurKelasId);
    if (!courseFlow) {
      throw new NotFoundException('Flow Program not found');
    }

    Object.assign(courseFlow, updateAlurKelaDto);
    return await this.alurKelasRepository.save(courseFlow);
  }

  async remove(alurKelasId: number, courseId) {
    const courseFlow = await this.findOne(alurKelasId);
    if (!courseFlow) {
      throw new NotFoundException('Flow Program not found');
    }
    await this.alurKelasRepository.remove(courseFlow);
    const semua_course_flows = await this.alurKelasRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semua_course_flows.length; i++) {
      semua_course_flows[i].sequence = i + 1;
      await this.alurKelasRepository.save(semua_course_flows[i]);
    }
  }
}
