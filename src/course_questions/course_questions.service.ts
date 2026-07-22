import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseQuestionDto } from './dto/create-course_question.dto';
import { UpdateCourseQuestionDto } from './dto/update-course_question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class CourseQuestionsService {
  constructor(
    @InjectRepository(CourseQuestions)
    private pertanyaanKelasRepository: Repository<CourseQuestions>,
    @InjectRepository(Course)
    private kelasRepository: Repository<Course>,
  ) {}

  async create(createPertanyaanKelaDto: CreateCourseQuestionDto) {
    const course = await this.kelasRepository.findOne({
      where: { id: createPertanyaanKelaDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const pertanyaanKelas = this.pertanyaanKelasRepository.create({
      questions: createPertanyaanKelaDto.questions,
      answers: createPertanyaanKelaDto.answer,
      course: course,
    });

    return await this.pertanyaanKelasRepository.save(pertanyaanKelas);
  }

  async findAll() {
    return await this.pertanyaanKelasRepository.find({
      relations: ['course'],
      order: { id: 'DESC' },
    });
  }

  async findAllCourses() {
    return await this.kelasRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pertanyaanKelas = await this.pertanyaanKelasRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!pertanyaanKelas) {
      throw new NotFoundException('FAQ program not found');
    }

    return pertanyaanKelas;
  }

  async update(id: number, updatePertanyaanKelaDto: UpdateCourseQuestionDto) {
    const pertanyaanKelas = await this.findOne(id);

    if (updatePertanyaanKelaDto.courseId) {
      const course = await this.kelasRepository.findOne({
        where: { id: updatePertanyaanKelaDto.courseId },
      });

      if (!course) {
        throw new NotFoundException('Program not found');
      }

      pertanyaanKelas.course = course;
    }

    Object.assign(pertanyaanKelas, updatePertanyaanKelaDto);
    return await this.pertanyaanKelasRepository.save(pertanyaanKelas);
  }

  async remove(id: number) {
    const pertanyaanKelas = await this.findOne(id);
    return await this.pertanyaanKelasRepository.remove(pertanyaanKelas);
  }
}
