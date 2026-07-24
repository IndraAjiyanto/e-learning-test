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
    private readonly mingguRepository: Repository<Weeks>,

    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,

    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,

    @InjectRepository(UserCourse)
    private readonly userKelasRepository: Repository<UserCourse>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(createMingguDto: CreateWeeksDto, courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('course Not Found');
    }
    if (createMingguDto.weekNumber === 1) {
      const data = await this.mingguRepository.create({
        ...createMingguDto,
        course: course,
      });
      const weeks = await this.mingguRepository.save(data);

      const userKelass = await this.userKelasRepository.find({
        where: { course: { id: course.id }, progress: false },
        relations: ['user'],
      });
      if (userKelass.length > 0) {
        for (const userKelas of userKelass) {
          const existingProgresMinggu =
            await this.weekProgressRepository.findOne({
              where: {
                week: { id: weeks.id },
                user: { id: userKelas.user.id },
              },
            });
          if (existingProgresMinggu) {
            await this.weekProgressRepository.save({
              id: existingProgresMinggu.id,
              week: weeks,
              user: userKelas.user,
              quiz: false,
              process: true,
            });
          } else {
            await this.weekProgressRepository.save({
              week: weeks,
              user: userKelas.user,
              quiz: false,
              process: true,
            });
          }
        }
        return weeks;
      }
    } else {
      const weeks = await this.mingguRepository.findOne({
        where: {
          weekNumber: createMingguDto.weekNumber - 1,
          course: { id: course.id },
        },
        relations: ['weekProgresses'],
      });

      if (!weeks) {
        throw new NotFoundException(
          'weeks sebelumnya harus dibuat terlebih dahulu',
        );
      } else if (!weeks.isFinal) {
        if (createMingguDto.isFinalCheck === 'true') {
          createMingguDto.isFinal = true;
        }
        const data = await this.mingguRepository.create({
          ...createMingguDto,
          course: course,
        });
        const newMinggu = await this.mingguRepository.save(data);

        if (weeks.weekProgresses.length > 0) {
          const weekProgress = await this.weekProgressRepository.find({
            where: { week: { id: weeks.id }, process: true, quiz: true },
            relations: ['user'],
          });

          if (weekProgress.length > 0) {
            for (const progres of weekProgress) {
              await this.weekProgressRepository.save({
                week: newMinggu,
                user: progres.user,
                quiz: false,
                process: true,
              });
            }
          }
        }
        return newMinggu;
      } else {
        throw new BadRequestException(
          'Minggu sebelumnya sudah final, tidak bisa menambahkan week baru',
        );
      }
    }
  }

  async noPertemuan(courseId: number) {
    const mingguTerakhir = await this.findCourseWeeks(courseId);
    const mingguBaru = mingguTerakhir + 1;
    return mingguBaru;
  }

  async findCourseWeeks(courseId: number) {
    const weeks = await this.mingguRepository.findOne({
      where: { course: { id: courseId } },
      order: { weekNumber: 'DESC' },
    });
    if (!weeks) {
      return 0;
    }
    return weeks.weekNumber;
  }

  async findOne(weeksId: number) {
    return await this.mingguRepository.findOne({
      where: { id: weeksId },
      relations: ['course'],
    });
  }

  async findPertemuan(weeksId: number) {
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

  async findPertemuanAkhir(weeksId: number) {
    return await this.sessionRepository.findOne({
      where: { weeks: { id: weeksId }, isFinal: true },
    });
  }

  async update(id: number, updateMingguDto: UpdateWeeksDto) {
    const weeks = await this.findOne(id);
    if (!weeks) {
      throw new NotFoundException('week not found');
    }

    if (weeks.isFinal) {
      throw new BadRequestException('Week final tidak bisa diupdate');
    }

    if (updateMingguDto.isFinalCheck === 'true') {
      updateMingguDto.isFinal = true;
    } else {
      updateMingguDto.isFinal = false;
    }
    Object.assign(weeks, updateMingguDto);
    return await this.mingguRepository.save(weeks);
  }

  async remove(id: number, courseId: number) {
    const weeks = await this.findOne(id);
    if (!weeks) {
      throw new NotFoundException('week not found');
    }
    await this.mingguRepository.remove(weeks);
    const semuaMinggu = await this.mingguRepository.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semuaMinggu.length; i++) {
      semuaMinggu[i].weekNumber = i + 1;
      await this.mingguRepository.save(semuaMinggu[i]);
    }
  }
}
