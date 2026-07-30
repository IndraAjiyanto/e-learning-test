import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWeeksDto } from './dto/create-weeks.dto';
import { UpdateWeeksDto } from './dto/update-weeks.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Weeks } from 'src/entities/weeks.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Session } from 'src/entities/session.entity';
import { Quiz } from 'src/entities/quiz.entity';

@Injectable()
export class WeeksService {
  constructor(
    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,

    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(createWeekDto: CreateWeeksDto, courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('course Not Found');
    }
    if (createWeekDto.weekNumber === 1) {
      const data = await this.weeksRepository.create({
        ...createWeekDto,
        course: course,
      });
      const weeks = await this.weeksRepository.save(data);

      const userCourses = await this.userCourseRepository.find({
        where: { course: { id: course.id }, progress: false },
        relations: ['user'],
      });
      if (userCourses.length > 0) {
        for (const userCourse of userCourses) {
          const existingWeekProgress =
            await this.weekProgressRepository.findOne({
              where: {
                week: { id: weeks.id },
                user: { id: userCourse.user.id },
              },
            });
          if (existingWeekProgress) {
            await this.weekProgressRepository.save({
              id: existingWeekProgress.id,
              week: weeks,
              user: userCourse.user,
              quiz: false,
              process: true,
            });
          } else {
            await this.weekProgressRepository.save({
              week: weeks,
              user: userCourse.user,
              quiz: false,
              process: true,
            });
          }
        }
        return weeks;
      }
    } else {
      const weeks = await this.weeksRepository.findOne({
        where: {
          weekNumber: createWeekDto.weekNumber - 1,
          course: { id: course.id },
        },
        relations: ['weekProgresses'],
      });

      if (!weeks) {
        throw new NotFoundException(
          'Previous week must be created first',
        );
      } else if (!weeks.isFinal) {
        if (createWeekDto.isFinalCheck === 'true') {
          createWeekDto.isFinal = true;
        }
        const data = await this.weeksRepository.create({
          ...createWeekDto,
          course: course,
        });
        const newWeek = await this.weeksRepository.save(data);

        if (weeks.weekProgresses.length > 0) {
          const weekProgress = await this.weekProgressRepository.find({
            where: { week: { id: weeks.id }, process: true, quiz: true },
            relations: ['user'],
          });

          if (weekProgress.length > 0) {
            for (const progress of weekProgress) {
              await this.weekProgressRepository.save({
                week: newWeek,
                user: progress.user,
                quiz: false,
                process: true,
              });
            }
          }
        }
        return newWeek;
      } else {
        throw new BadRequestException(
          'Previous week is already finalized, cannot add a new week',
        );
      }
    }
  }

  async getSessionNumber(courseId: number) {
    const lastWeek = await this.findCourseWeeks(courseId);
    const newWeek = lastWeek + 1;
    return newWeek;
  }

  async findCourseWeeks(courseId: number) {
    const weeks = await this.weeksRepository.findOne({
      where: { course: { id: courseId } },
      order: { weekNumber: 'DESC' },
    });
    if (!weeks) {
      return 0;
    }
    return weeks.weekNumber;
  }

  async findOne(weeksId: number) {
    return await this.weeksRepository.findOne({
      where: { id: weeksId },
      relations: ['course'],
    });
  }

  async findSession(weeksId: number) {
    return await this.sessionRepository.find({
      where: { weeks: { id: weeksId } },
      order: { sessionOrder: 'ASC' },
    });
  }

  async findQuiz(weeksId: number) {
    return await this.quizRepository.find({
      where: { weeks: { id: weeksId } },
    });
  }

  async findLastSession(weeksId: number) {
    return await this.sessionRepository.findOne({
      where: { weeks: { id: weeksId }, isFinal: true },
    });
  }

  async update(id: number, updateWeekDto: UpdateWeeksDto) {
    const weeks = await this.findOne(id);
    if (!weeks) {
      throw new NotFoundException('week not found');
    }

    if (weeks.isFinal) {
      throw new BadRequestException('Finalized week cannot be updated');
    }

    if (updateWeekDto.isFinalCheck === 'true') {
      updateWeekDto.isFinal = true;
    } else {
      updateWeekDto.isFinal = false;
    }
    Object.assign(weeks, updateWeekDto);
    return await this.weeksRepository.save(weeks);
  }

  async remove(id: number, courseId: number) {
    const weeks = await this.findOne(id);
    if (!weeks) {
      throw new NotFoundException('week not found');
    }
    await this.weeksRepository.remove(weeks);
    const allWeeks = await this.weeksRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < allWeeks.length; i++) {
      allWeeks[i].weekNumber = i + 1;
      await this.weeksRepository.save(allWeeks[i]);
    }
  }
}
