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
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  async create(createRegistrationDto: CreateRegistrationsDto) {
    const user = await this.userRepository.findOne({
      where: { id: createRegistrationDto.userId },
    });
    if (!user) {
      return;
    }

    const course = await this.courseRepository.findOne({
      where: { id: createRegistrationDto.courseId },
    });
    if (!course) {
      return;
    }

    const check = await this.checkRegistration(
      createRegistrationDto.userId,
      createRegistrationDto.courseId,
    );
    if (check == false) {
      return false;
    } else {
      const registration = await this.registrationRepository.create({
        ...createRegistrationDto,
        user: user,
        course: course,
      });
      return await this.registrationRepository.save(registration);
    }
  }

  async checkRegistration(userId: number, courseId: number) {
    const registration = await this.registrationRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
        process: Not('rejected'),
      },
    });
    if (registration.length) {
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
    return await this.registrationRepository.find();
  }

  async findRegistration(userId: number) {
    return await this.registrationRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: number) {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!registration) {
      throw new NotFoundException('registration not found');
    }
    return registration;
  }

  async addUserToCourse(userId: number, courseId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userCourses', 'userCourses.course'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const alreadyJoined = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (alreadyJoined) {
      throw new BadRequestException('User already joined the program');
    }

    const userCourses = await this.userCourseRepository.create({
      progress: false,
      user: user,
      course: course,
    });

    return await this.userCourseRepository.save(userCourses);
  }

  async removeCourseUser(userId: number, courseId: number): Promise<UserCourse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const userCourse = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourse) {
      throw new BadRequestException('User is not enrolled in this program');
    }

    return await this.userCourseRepository.remove(userCourse);
  }

  async update(
    registrationId: number,
    updateRegistrationDto: UpdateRegistrationsDto,
  ) {
    const registration = await this.findOne(registrationId);
    if (!registration) {
      return;
    }
    Object.assign(registration, updateRegistrationDto);
    return await this.registrationRepository.save(registration);
  }
}
