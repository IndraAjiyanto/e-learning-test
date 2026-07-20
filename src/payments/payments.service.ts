import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Registration } from 'src/entities/registration.entity';
import { Installment } from 'src/entities/installment.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Session } from 'src/entities/session.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly pembayaranRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Registration)
    private readonly pendaftaranRepository: Repository<Registration>,
    @InjectRepository(Installment)
    private readonly cicilanRepository: Repository<Installment>,
    @InjectRepository(UserCourse)
    private readonly userKelasRepository: Repository<UserCourse>,
    @InjectRepository(WeekProgress)
    private readonly progresMingguRepository: Repository<WeekProgress>,
    @InjectRepository(SessionProgress)
    private readonly progresPertemuanRepository: Repository<SessionProgress>,
    @InjectRepository(Weeks)
    private readonly mingguRepository: Repository<Weeks>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(createPembayaranDto: CreatePembayaranDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPembayaranDto.userId },
    });
    if (!user) {
      return;
    }

    const course = await this.kelasRepository.findOne({
      where: { id: createPembayaranDto.courseId },
    });
    if (!course) {
      return;
    }

    if (createPembayaranDto.cicilanId) {
      const installments = await this.cicilanRepository.findOne({
        where: { id: createPembayaranDto.cicilanId },
      });
      if (!installments) {
        return;
      }
      const check = await this.checkPembayaran(
        createPembayaranDto.userId,
        createPembayaranDto.courseId,
      );
      if (check == false) {
        return false;
      } else {
        const pembayaran = await this.pembayaranRepository.create({
          ...createPembayaranDto,
          user: user,
          course: course,
          installment: installments,
        });
        return await this.pembayaranRepository.save(pembayaran);
      }
    }

    const check = await this.checkPembayaran(
      createPembayaranDto.userId,
      createPembayaranDto.courseId,
    );
    if (check == false) {
      return false;
    } else {
      const pembayaran = await this.pembayaranRepository.create({
        ...createPembayaranDto,
        user: user,
        course: course,
      });
      return await this.pembayaranRepository.save(pembayaran);
    }
  }

  async addUserToKelas(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'weeks.session'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const sudahGabung = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (sudahGabung) {
      throw new BadRequestException('User already joined the program');
    }

    const userCourses = await this.userKelasRepository.create({
      progress: false,
      user: user,
      course: course,
    });

    await this.userKelasRepository.save(userCourses);

    if (course.weeks.length > 0) {
      const weeks = await this.mingguRepository.findOne({
        where: { course: { id: courseId }, weekNumber: 1 },
        relations: ['session'],
      });
      const minggu_akhir = await this.mingguRepository.findOne({
        where: { course: { id: courseId }, isFinal: true },
      });
      if (weeks) {
        const existingProgresMinggu =
          await this.progresMingguRepository.findOne({
            where: {
              week: { id: weeks.id },
              user: { id: userId },
            },
          });
        if (existingProgresMinggu) {
          await this.progresMingguRepository.save({
            id: existingProgresMinggu.id,
            weeks: weeks,
            user: user,
            proses: true,
            quiz: false,
          });
        } else {
          await this.progresMingguRepository.save({
            weeks: weeks,
            user: user,
            proses: true,
            quiz: false,
          });
        }

        const session = await this.sessionRepository.findOne({
          where: { weeks: { id: weeks.id }, sessionOrder: 1 },
          relations: [],
        });
        if (session) {
          const existingProgresPertemuan =
            await this.progresPertemuanRepository.findOne({
              where: { session: { id: session.id }, user: { id: userId } },
            });
          if (existingProgresPertemuan) {
            await this.progresPertemuanRepository.save({
              id: existingProgresPertemuan.id,
              session: session,
              user: user,
              attendances: true,
              logbook: false,
            });
          } else {
            await this.progresPertemuanRepository.save({
              session: session,
              user: user,
              attendances: true,
              logbook: false,
            });
          }
        }
      } else if (minggu_akhir) {
        const progresMingguAkhir = await this.progresMingguRepository.findOne({
          where: {
            week: { id: minggu_akhir.id },
            user: { id: userId },
            process: true,
            quiz: true,
          },
        });
        if (progresMingguAkhir) {
          await this.userKelasRepository.update(userCourses.id, {
            progress: true,
          });
        }
      }
    }
  }

  async removeUserKelas(userId: number, courseId: number): Promise<UserCourse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const userKelas = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userKelas) {
      throw new BadRequestException('User is not enrolled in this program');
    }

    return await this.userKelasRepository.remove(userKelas);
  }

  async checkPembayaran(userId: number, courseId: number) {
    const pembayaran = await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
        process: Not('rejected'),
      },
    });
    if (pembayaran.length) {
      return false;
    } else {
      return true;
    }
  }

  async findKelas(courseId: number) {
    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['weeks', 'category'],
    });
    if (!course) {
      return;
    } else {
      return course;
    }
  }

  async findPembayaran(userId: number) {
    const pembayaran = await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        installment: IsNull(),
      },
      relations: ['course', 'course.category', 'installments'],
    });

    if (!pembayaran) {
      return;
    } else {
      return pembayaran;
    }
  }

  async findCicilan(userId: number) {
    return await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        installment: Not(IsNull()),
      },
      relations: ['course', 'course.category', 'installments'],
    });
  }

  async findPendaftaran(userId: number) {
    return await this.pendaftaranRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.category'],
    });
  }

  async findAll() {
    return await this.pembayaranRepository.find({
      where: { installment: IsNull() },
      relations: ['user', 'course', 'course.category'],
    });
  }

  async findAllCicilan() {
    return await this.pembayaranRepository.find({
      where: { installment: Not(IsNull()) },
      relations: ['user', 'course', 'course.category', 'installments'],
    });
  }

  async findAllPendaftaran() {
    return await this.pendaftaranRepository.find({
      relations: ['user', 'course', 'course.category'],
    });
  }

  async findOne(pembayaranId: number) {
    const pembayaran = await this.pembayaranRepository.findOne({
      where: { id: pembayaranId },
      relations: ['user', 'course'],
    });
    if (!pembayaran) {
      throw new NotFoundException('Payment not found');
    } else {
      return pembayaran;
    }
  }

  async update(pembayaranId: number, updatePembayaranDto: UpdatePembayaranDto) {
    const pembayaran = await this.findOne(pembayaranId);
    if (!pembayaran) {
      return;
    }
    Object.assign(pembayaran, updatePembayaranDto);
    return await this.pembayaranRepository.save(pembayaran);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
