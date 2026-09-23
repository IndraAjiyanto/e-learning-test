import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Quiz } from 'src/entities/quiz.entity';

@Injectable()
export class SyllabusService {
  constructor(
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(SyllabusProgress)
    private readonly syllabusProgressRepository: Repository<SyllabusProgress>,

    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(createSyllabusDto: CreateSyllabusDto, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const data = this.syllabusRepository.create({
      ...createSyllabusDto,
      course: course,
    });
    const syllabus = await this.syllabusRepository.save(data);

    // Buat SyllabusProgress untuk semua user yang enrolled di course ini
    const userCourses = await this.userCourseRepository.find({
      where: { course: { id: course.id }, progress: false },
      relations: ['user'],
    });
    if (userCourses.length > 0) {
      for (const userCourse of userCourses) {
        const existing = await this.syllabusProgressRepository.findOne({
          where: {
            syllabus: { id: syllabus.id },
            user: { id: userCourse.user.id },
          },
        });
        if (!existing) {
          await this.syllabusProgressRepository.save({
            syllabus: syllabus,
            user: userCourse.user,
            quiz: false,
            process: true,
          });
        }
      }
    }

    return syllabus;
  }

  async findByCourse(courseId: string) {
    return await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(syllabusId: string) {
    return await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course'],
    });
  }

  async findQuiz(syllabusId: string) {
    return await this.quizRepository.find({
      where: { syllabus: { id: syllabusId } },
    });
  }

  async update(id: string, updateSyllabusDto: UpdateSyllabusDto) {
    const syllabus = await this.findOne(id);
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    Object.assign(syllabus, updateSyllabusDto);
    return await this.syllabusRepository.save(syllabus);
  }

  async remove(id: string) {
    const syllabus = await this.findOne(id);
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }
    return await this.syllabusRepository.remove(syllabus);
  }
}

