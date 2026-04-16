import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { KelassService } from 'src/kelass/kelass.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailService } from 'src/common/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private kelasService: KelassService,
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
    const isMatch = await bcrypt.compare(
      createUserDto.password,
      createUserDto.confirm_password,
    );
    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    createUserDto.verifikasiToken = hashedToken;
    createUserDto.verifikasiTokenExpires = new Date(Date.now() + 60000);

    if (!isMatch) {
      try {
        const user_data = await this.userRepository.create({ ...createUserDto, isVerified: false });
        const user = await this.userRepository.save(user_data);
        await this.emailService.sendVerificationEmail(
          createUserDto.email,
          resetToken,
          createUserDto.username,
        );
        return user;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    } else {
      throw new BadRequestException('Password no match');
    }
  }

  async findAllKelas() {
    return await this.kelasService.findAllLaunch();
  }

  async findKelas(id: number) {
    return await this.kelasService.findOne(id);
  }
}
