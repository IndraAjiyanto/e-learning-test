import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findCourseSyllabus(courseId: string): Promise<number> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { course: { id: courseId } },
      order: { syllabusNumber: 'DESC' },
    });
    if (!syllabus) {
      return 0;
    }
    return syllabus.syllabusNumber;
  }

  async getSyllabusNumber(courseId: string): Promise<number> {
    const lastNumber = await this.findCourseSyllabus(courseId);
    return lastNumber + 1;
  }

  async create(createSyllabusDto: CreateSyllabusDto, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const syllabusNumber =
      createSyllabusDto.syllabusNumber ??
      (await this.getSyllabusNumber(courseId));

    if (syllabusNumber > 1) {
      const previousSyllabus = await this.syllabusRepository.findOne({
        where: { course: { id: courseId }, syllabusNumber: syllabusNumber - 1 },
      });
      if (previousSyllabus && previousSyllabus.isFinal) {
        throw new BadRequestException(
          'Previous syllabus is already finalized, cannot add a new syllabus',
        );
      }
    }

    let parsedContent = createSyllabusDto.content;
    if (typeof parsedContent === 'string' && parsedContent.trim()) {
      try {
        parsedContent = JSON.parse(parsedContent);
      } catch (e) {
        parsedContent = null;
      }
    }

    const isFinal =
      createSyllabusDto.isFinal === true ||
      createSyllabusDto.isFinal === ('true' as any);

    const data = this.syllabusRepository.create({
      title: createSyllabusDto.title,
      description: createSyllabusDto.description,
      content: parsedContent ?? undefined,
      syllabusNumber: syllabusNumber,
      isFinal: isFinal,
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
      order: { syllabusNumber: 'ASC', createdAt: 'ASC' },
      relations: ['quiz'],
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

    let parsedContent = updateSyllabusDto.content;
    if (typeof parsedContent === 'string' && parsedContent.trim()) {
      try {
        parsedContent = JSON.parse(parsedContent);
      } catch (e) {
        parsedContent = null;
      }
    }

    const isFinal =
      updateSyllabusDto.isFinal !== undefined
        ? updateSyllabusDto.isFinal === true ||
          updateSyllabusDto.isFinal === ('true' as any)
        : syllabus.isFinal;

    Object.assign(syllabus, {
      ...updateSyllabusDto,
      ...(parsedContent !== undefined ? { content: parsedContent } : {}),
      isFinal,
    });
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

