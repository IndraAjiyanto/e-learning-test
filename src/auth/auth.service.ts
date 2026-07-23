import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailService } from 'src/common/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from 'src/courses/courses.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private kelasService: CoursesService,
    private emailService: EmailService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new BadRequestException('Invalid email or password');
    }
  }

  async createAcount(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirm_password) {
      throw new BadRequestException('Password does not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    createUserDto.verificationToken = hashedToken;
    createUserDto.verificationTokenExpires = new Date(Date.now() + 60000);

    try {
      const user_data = await this.userRepository.create({ ...createUserDto, isVerified: false });
      const user = await this.userRepository.save(user_data);
      try {
        await this.emailService.sendVerificationEmail(
          createUserDto.email,
          resetToken,
          createUserDto.username,
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError.message);
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllCourses() {
    return await this.kelasService.findAllLaunch();
  }

  async findCourse(id: number) {
    return await this.kelasService.findOne(id);
  }
}
