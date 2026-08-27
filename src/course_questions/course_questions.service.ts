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
    private courseQuestionRepository: Repository<CourseQuestions>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseQuestionDto: CreateCourseQuestionDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createCourseQuestionDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const courseQuestion = this.courseQuestionRepository.create({
      questions: createCourseQuestionDto.questions,
      answers: createCourseQuestionDto.answer,
      course: course,
    });

    return await this.courseQuestionRepository.save(courseQuestion);
  }

  async findAll() {
    return await this.courseQuestionRepository.find({
      relations: ['course'],
      order: { id: 'DESC' },
    });
  }

  async findAllCourses() {
    return await this.courseRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const courseQuestion = await this.courseQuestionRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!courseQuestion) {
      throw new NotFoundException('FAQ program not found');
    }

    return courseQuestion;
  }

  async update(id: number, updateCourseQuestionDto: UpdateCourseQuestionDto) {
    const courseQuestion = await this.findOne(id);

    if (updateCourseQuestionDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateCourseQuestionDto.courseId },
      });

      if (!course) {
        throw new NotFoundException('Program not found');
      }

      courseQuestion.course = course;
    }

    if (updateCourseQuestionDto.questions !== undefined) {
      courseQuestion.questions = updateCourseQuestionDto.questions;
    }

    if (updateCourseQuestionDto.answer !== undefined) {
      courseQuestion.answers = updateCourseQuestionDto.answer;
    }

    return await this.courseQuestionRepository.save(courseQuestion);
  }

  async remove(id: number) {
    const courseQuestion = await this.findOne(id);
    return await this.courseQuestionRepository.remove(courseQuestion);
  }
}
