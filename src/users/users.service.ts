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
import { Kelas } from 'src/entities/kelas.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Portfolio } from 'src/entities/portfolio.entity';
import { EmailService } from 'src/common/email/email.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,

    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const cekEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (!cekEmail) {
      const user = await this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } else {
      throw new NotFoundException('Email is already registered');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // return await this.userRepository.findOne({where: {email}, relations: ['user_kelas', 'user_kelas.kelas' ,'absen']});
    return await this.userRepository.findOne({
      where: { email },
      relations: {
        user_kelas: {
          kelas: true,
        },
        absen: true,
      },
    });
  }

  async findPortfolio(userId: number) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'kelas', 'kelas.jenis_kelas', 'kelas.kategori'],
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
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      updatePaaswordDto.password_lama,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (updatePaaswordDto.password_baru.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(
      updatePaaswordDto.password_baru,
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
    // Convert URL ke full path
    // /uploads/alumni/123.jpg → /project-root/public/uploads/alumni/123.jpg
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Hapus file
    await fs.unlink(filePath);
    console.log('File deleted:', filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found, skipping delete:', url);
    } else {
      console.error('Error deleting file:', error);
      // Tidak throw error agar proses lain tetap jalan
    }
  }
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

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal that user doesn't exist for security reasons
      throw new NotFoundException(
        'If this email exists, a reset link has been sent.',
      );
    }

    // Generate reset token (random 32 bytes hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // Send email with unhashed token (this is what user clicks)
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (error) {
      // Rollback token if email fails
      user.resetPasswordToken = null as any;
      user.resetPasswordExpires = null as any;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'Failed to send reset email. Please try again later.',
      );
    }

    return {
      message: 'Password reset email has been sent. Please check your inbox.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token and not expired
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :hashedToken', { hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password (will be hashed by @BeforeUpdate hook)
    user.password = password;
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;

    await this.userRepository.save(user);


    return {
      message:
        'Password has been reset successfully. You can now login with your new password.',
    };
  }
}
