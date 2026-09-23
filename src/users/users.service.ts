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
import { Logbook } from 'src/entities/logbook.entity';
import { Certificates } from 'src/entities/certificate.entity';
import { EmailService } from 'src/common/email/email.service';
import * as fs from 'fs/promises';
import { assertStrongPassword } from 'src/common/utils/password.util';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,

    @InjectRepository(Logbook)
    private readonly logbookRepository: Repository<Logbook>,

    @InjectRepository(Certificates)
    private readonly certificateRepository: Repository<Certificates>,

    private readonly emailService: EmailService,
  ) {}

  private async generateVerificationToken(user: User): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 120000);

    await this.userRepository.save(user);
    return rawToken;
  }

  async sendVerificationEmailToUser(user: User): Promise<User> {
    const rawToken = await this.generateVerificationToken(user);

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        rawToken,
        user.username,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);

      user.verificationToken = null;
      user.verificationTokenExpires = null;

      await this.userRepository.save(user);

      throw new BadRequestException(
        'Failed to send verification email. Please try again.',
      );
    }
    
    return user;
  }
  async sendAdminVerificationEmailToUser(user: User, rawPassword?: string): Promise<User> {
    const rawToken = await this.generateVerificationToken(user);

    try {
      await this.emailService.sendAdminVerificationEmail(
        user.email,
        rawToken,
        user.username,
        rawPassword,
      );
    } catch (error) {
      console.error('Failed to send admin verification email:', error);

      user.verificationToken = null;
      user.verificationTokenExpires = null;

      await this.userRepository.save(user);

      throw new BadRequestException(
        'Failed to send verification email. Please try again.',
      );
    }
    
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const cekEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (cekEmail) {
      throw new NotFoundException('Email is already registered');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      isVerified: false,
      resetPasswordToken: 'MUST_CHANGE_PASSWORD',
    });
    const savedUser = await this.userRepository.save(user);

    await this.sendAdminVerificationEmailToUser(savedUser, createUserDto.password);

    return savedUser;
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
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (params.search) {
      query.where(
        '(user.username ILIKE :search OR user.email ILIKE :search OR CAST(user.role AS text) ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    query.skip((params.page - 1) * params.limit).take(params.limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findWithCourses(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userCourses: {
          course: {
            category: true,
            courseType: true,
            weeks: true,
          },
        },
      },
    });
  }

  async findPortfolio(userId: string) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: [
        'user',
        'course',
        'course.courseType',
        'course.category',
        'course.technologies',
      ],
    });
  }

  async findCompletedCoursesByUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'userCourses',
        'userCourses.course',
        'userCourses.course.category',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedCourses = user.userCourses.filter(
      (uc) =>
        uc.progress === true && uc.course && uc.course.process === 'approved',
    );
    return { userCourses: completedCourses };
  }

  async findAllLogbooks(userId: string) {
    return await this.logbookRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'session', 'session.weeks', 'session.weeks.course'],
    });
  }

  async findAll() {
    return await this.userRepository.find({
      where: { email: Not('super@gmail.com') },
    });
  }

  /**
   * Statistik untuk tab Dashboard student.
   *
   * Dulu dihitung inline di GET /users/profile saja, sehingga dua rute lain yang
   * merender shell yang sama (GET /program/myProgram/:id dan GET /quiz/start/:id)
   * menampilkan angka nol begitu user menekan Dashboard di sidebar. Sekarang satu
   * tempat, dipakai ketiganya.
   *
   * certificatesCount dihitung dari tabel certificates, bukan lagi disamakan
   * dengan jumlah course yang selesai. Sertifikat baru ada setelah student
   * benar-benar mengunduhnya, jadi angka lama bisa lebih besar dari kenyataan.
   */
  async getDashboardData(userId: string) {
    const userWithCourses = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'userCourses',
        'userCourses.course',
        'userCourses.course.category',
        // Baris Continue Learning pada frame dashboard memakai dua keterangan
        // di bawah judul; yang kedua diambil dari tipe kelas.
        'userCourses.course.courseType',
      ],
    });

    const userCourses = userWithCourses?.userCourses ?? [];
    const ongoingCourses = userCourses.filter((uc) => !uc.progress);
    const completedCourses = userCourses.filter((uc) => uc.progress);

    const certificatesCount = await this.certificateRepository.count({
      where: { user: { id: userId } },
    });

    // Persentase kemajuan dihitung di sini, bukan di template. Handlebars hanya
    // punya divide/multiply, jadi merakitnya di view berarti tiga helper
    // bersarang untuk satu angka - dan pembagian nol harus dijaga dua kali.
    const totalCourses = userCourses.length;
    const completionPercent = totalCourses
      ? Math.round((completedCourses.length / totalCourses) * 100)
      : 0;

    // Komposisi program yang diikuti, dikelompokkan per tipe kelas.
    //
    // Idenya dari donat "Komposisi Pembelian" di dasbor bisa.ai. Sumbernya
    // sengaja BUKAN transaksi: tabel pembayaran tidak ikut dimuat di rute ini,
    // dan program gratis tidak punya baris transaksi sama sekali - komposisinya
    // akan bohong untuk sebagian student. Tipe kelas ada pada setiap program
    // yang benar-benar diikuti, jadi angkanya selalu berasal dari kenyataan.
    const compositionCounts = new Map<string, number>();
    for (const uc of userCourses) {
      const label =
        uc.course?.courseType?.nameClassesType?.trim() ||
        uc.course?.category?.name?.trim() ||
        'Uncategorised';
      compositionCounts.set(label, (compositionCounts.get(label) ?? 0) + 1);
    }
    const programComposition = [...compositionCounts.entries()]
      .map(([label, count]) => ({
        label,
        count,
        percent: totalCourses ? Math.round((count / totalCourses) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return {
      ongoingCourses,
      programComposition,
      dashboardStats: {
        ongoingCount: ongoingCourses.length,
        completedCount: completedCourses.length,
        totalCount: totalCourses,
        completionPercent,
        certificatesCount,
      },
    };
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['biodata'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: string, updatePaaswordDto: UpdatePasswordDto) {
    if (updatePaaswordDto.newPassword !== updatePaaswordDto.confirmPassword) {
      throw new BadRequestException('confirm password wrong');
    }

    // Aturan yang sama dengan pendaftaran (auth.service) dan lupa-password
    // (resetPassword di berkas ini). Sebelumnya rute ini satu-satunya yang
    // memakai aturannya sendiri - cukup 6 karakter, tanpa syarat lain - jadi
    // mengganti password justru bisa MELEMAHKAN akun yang password awalnya
    // sudah dipaksa kuat saat mendaftar.
    assertStrongPassword(updatePaaswordDto.newPassword);

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

    const hashedPassword = await bcrypt.hash(updatePaaswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;

    await this.userRepository.save(user);

    return { message: 'Password berhasil diubah' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findOne(userId);
    Object.assign(user, updateProfileDto);
    return await this.userRepository.save(user);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async remove(id: string) {
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

    assertStrongPassword(password);

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
    if (!token) {
      throw new BadRequestException('Invalid or expired verification token');
    }

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
    if (!token) {
      throw new NotFoundException('User not found');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    let user = await this.userRepository.findOne({
      where: { verificationToken: hashedToken },
    });
    if (!user) {
      user = await this.userRepository.findOne({
        where: { verificationToken: token },
      });
    }
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

    return await this.sendVerificationEmailToUser(user);
  }

  async resendVerificationByAdmin(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    return await this.sendVerificationEmailToUser(user);
  }

  async resendVerificationByUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    return await this.sendVerificationEmailToUser(user);
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
    if (!token) {
      throw new NotFoundException('User not found');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    let user = await this.userRepository.findOne({
      where: { verificationToken: hashedToken },
    });
    if (!user) {
      user = await this.userRepository.findOne({
        where: { verificationToken: token },
      });
    }

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
      return user.verificationTokenExpires.getTime() - Date.now();
    }
    return 0;
  }

  async findUserByToken(token: string) {
    if (!token) {
      throw new NotFoundException('User not found');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    let user = await this.userRepository.findOne({
      where: { verificationToken: hashedToken },
    });
    if (!user) {
      user = await this.userRepository.findOne({
        where: { verificationToken: token },
      });
    }
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
