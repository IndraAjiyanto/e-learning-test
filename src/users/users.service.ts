import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Portofolios } from 'src/entities/portofolios.entity';
import { EmailService } from 'src/common/email/email.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,

    private readonly emailService: EmailService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const cekEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (!cekEmail) {
      const user = await this.userRepository.create({ ...createUserDto, isVerified: true });
      return await this.userRepository.save(user);
    } else {
      throw new NotFoundException('Email is already registered');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: {
        userCourses: {
          course: true,
        },
        absent: true,
      },
    });
  }

  async findAllPaginated(params: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const query = this.userRepository.createQueryBuilder('user')
      .orderBy('user.id', 'DESC');

    if (params.search) {
      query.where(
        '(user.username ILIKE :search OR user.email ILIKE :search OR CAST(user.role AS text) ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    query.skip((params.page - 1) * params.limit).take(params.limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findPortfolio(userId: number) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'course', 'course.courseType', 'course.category'],
    });
  }

  async findAll() {
    return await this.userRepository.find({
      where: { email: Not('super@gmail.com') },
    });
  }

  async findOne(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['biodata'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: number, updatePaaswordDto: UpdatePasswordDto) {
    if (
      updatePaaswordDto.newPassword !== updatePaaswordDto.confirmPassword
    ) {
      throw new BadRequestException('confirm password wrong');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      updatePaaswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (updatePaaswordDto.newPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters',
      );
    }

    const hashedPassword = await bcrypt.hash(
      updatePaaswordDto.newPassword,
      10,
    );
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: 'Password berhasil diubah' };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.findOne(userId);
    Object.assign(user, updateProfileDto);
    return await this.userRepository.save(user);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) { }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.remove(user);
  }

  // ============================================
  // FORGOT PASSWORD & RESET PASSWORD
  // ============================================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(
        'If this email exists, a reset link has been sent.',
      );
    }

    if (
      user.resetPasswordToken &&
      user.resetPasswordExpires &&
      user.resetPasswordExpires > new Date()
    ) {
      throw new BadRequestException(
        'Verification email already sent. Please check your inbox or wait until token expires.',
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 120000);

    const newUser = await this.userRepository.save(user);

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (error) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'Failed to send reset email. Please try again later.',
      );
    }

    return newUser.resetPasswordToken;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :hashedToken', { hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return {
      message:
        'Password has been reset successfully. You can now login with your new password.',
    };
  }

  async tokenPasswordExpired(token: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isVerified) {
      throw new BadRequestException('User not verified');
    }
    if (
      user.resetPasswordToken &&
      user.resetPasswordExpires &&
      user.resetPasswordExpires > new Date()
    ) {
      const remainingMs = user.resetPasswordExpires.getTime() - Date.now();
      return remainingMs;
    }
  }

  async verifyEmail(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.verificationToken = :hashedToken', { hashedToken })
      .andWhere('user.verificationTokenExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await this.userRepository.save(user);

    return user;
  }

  async sendVerificationEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.verificationToken &&
      user.verificationTokenExpires &&
      user.verificationTokenExpires > new Date()
    ) {
      throw new BadRequestException(
        'Verification email already sent. Please check your inbox or wait until token expires.',
      );
    }
    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 120000);

    const newUser = await this.userRepository.save(user);

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
    }
    return newUser;
  }

  async findUserByTokenPassword(token: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async tokenExpired(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }
    if (
      user.verificationToken &&
      user.verificationTokenExpires &&
      user.verificationTokenExpires > new Date()
    ) {
      const remainingMs = user.verificationTokenExpires.getTime() - Date.now();
      return remainingMs;
    }
  }

  async findUserByToken(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validateResetToken(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :hashedToken', { hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    return user;
  }
}
