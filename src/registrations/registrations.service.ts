import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistrationsDto } from './dto/create-registrations.dto';
import { UpdateRegistrationsDto } from './dto/update-registrations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Registration } from 'src/entities/registration.entity';
import { Not, Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly pendaftaranRepository: Repository<Registration>,
    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCourse)
    private readonly userKelasRepository: Repository<UserCourse>,
  ) {}

  async create(createPendaftaranDto: CreateRegistrationsDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPendaftaranDto.userId },
    });
    if (!user) {
      return;
    }

    const course = await this.kelasRepository.findOne({
      where: { id: createPendaftaranDto.courseId },
    });
    if (!course) {
      return;
    }

    const check = await this.checkPendaftaran(
      createPendaftaranDto.userId,
      createPendaftaranDto.courseId,
    );
    if (check == false) {
      return false;
    } else {
      const pendaftaran = await this.pendaftaranRepository.create({
        ...createPendaftaranDto,
        user: user,
        course: course,
      });
      return await this.pendaftaranRepository.save(pendaftaran);
    }
  }

  async checkPendaftaran(userId: number, courseId: number) {
    const pendaftaran = await this.pendaftaranRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
        process: Not('rejected'),
      },
    });
    if (pendaftaran.length) {
      return false;
    } else {
      return true;
    }
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async findAll() {
    return await this.pendaftaranRepository.find();
  }

  async findPendaftaran(userId: number) {
    return await this.pendaftaranRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: number) {
    const pendaftaran = await this.pendaftaranRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!pendaftaran) {
      throw new NotFoundException('registration not found');
    }
    return pendaftaran;
  }

  async addUserToCourse(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userCourses', 'userCourses.course'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.kelasRepository.findOne({
      where: { id: courseId },
      relations: ['userCourses', 'userCourses.user'],
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

    return await this.userKelasRepository.save(userCourses);
  }

  async removeCourseUser(userId: number, courseId: number): Promise<UserCourse> {
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

  async update(
    pendaftaranId: number,
    updatePendaftaranDto: UpdateRegistrationsDto,
  ) {
    const pendaftaran = await this.findOne(pendaftaranId);
    if (!pendaftaran) {
      return;
    }
    Object.assign(pendaftaran, updatePendaftaranDto);
    return await this.pendaftaranRepository.save(pendaftaran);
  }
}
