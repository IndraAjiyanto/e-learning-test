import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseFlowDto } from './dto/create-course_flow.dto';
import { UpdateCourseFlowDto } from './dto/update-course_flow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class CourseFlowsService {
  constructor(
    @InjectRepository(CourseFlow)
    private readonly courseFlowRepository: Repository<CourseFlow>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseFlowDto: CreateCourseFlowDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createCourseFlowDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const finalFlow = await this.findCourseFlows(createCourseFlowDto.courseId);
    createCourseFlowDto.sequence = finalFlow + 1;

    const courseFlow = this.courseFlowRepository.create({
      ...createCourseFlowDto,
      course: course,
    });
    return await this.courseFlowRepository.save(courseFlow);
  }

  async noAlur(courseId: number) {
    const finalFlow = await this.findCourseFlows(courseId);
    const startFlow = finalFlow + 1;
    return startFlow;
  }

  async findCourseFlows(courseId: number) {
    const course_flows = await this.courseFlowRepository.findOne({
      where: { course: { id: courseId } },
      order: { sequence: 'DESC' },
    });
    if (!course_flows) {
      return 0;
    }
    return course_flows.sequence;
  }

  async findAll() {
    const course_flows = await this.courseFlowRepository.find({
      relations: ['course'],
      order: { course: { id: 'ASC' }, sequence: 'ASC' },
    });
    return course_flows;
  }

  async findAllCourses() {
    const course = await this.courseRepository.find({
      order: { id: 'ASC' },
    });
    return course;
  }

  async findOne(courseFlowId: number) {
    const course_flows = await this.courseFlowRepository.findOne({
      where: { id: courseFlowId },
      relations: ['course'],
    });
    if (!course_flows) {
      throw new NotFoundException('Flow Program not found');
    }
    return course_flows;
  }

  async update(courseFlowId: number, updateCourseFlowDto: UpdateCourseFlowDto) {
    const courseFlow = await this.findOne(courseFlowId);
    if (!courseFlow) {
      throw new NotFoundException('Flow Program not found');
    }

    Object.assign(courseFlow, updateCourseFlowDto);
    return await this.courseFlowRepository.save(courseFlow);
  }

  async remove(courseFlowId: number, courseId) {
    const courseFlow = await this.findOne(courseFlowId);
    if (!courseFlow) {
      throw new NotFoundException('Flow Program not found');
    }
    await this.courseFlowRepository.remove(courseFlow);
    const allCourseFlows = await this.courseFlowRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < allCourseFlows.length; i++) {
      allCourseFlows[i].sequence = i + 1;
      await this.courseFlowRepository.save(allCourseFlows[i]);
    }
  }
}
