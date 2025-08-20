import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as bcrypt from "bcrypt";
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create(createUserDto)
    return await this.userRepository.save(user)
  }

    async findByEmail(email: string): Promise<User | null>{
    return this.userRepository.findOne({where: {email}, relations: ['kelas', 'absen']});
  }

  async findAll() {
    return await this.userRepository.find({where: {email: Not('super@gmail.com')}})
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({where: {id}, relations: ['biodata']})
    if(!user){
      throw new NotFoundException()
    }
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
    Object.assign(user, updateUserDto)
    return await this.userRepository.save(user)
  }

async updatePassword(id: number, updatePaaswordDto: UpdatePasswordDto) {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException('User tidak ditemukan');
  }

  const isMatch = await bcrypt.compare(updatePaaswordDto.password_lama, user.password);
  if (!isMatch) {
    throw new BadRequestException('Password lama salah');
  }

  if (updatePaaswordDto.password_baru.length < 6) {
    throw new BadRequestException('Password baru minimal 6 karakter');
  }

  const hashedPassword = await bcrypt.hash(updatePaaswordDto.password_baru, 10);
  user.password = hashedPassword;

  await this.userRepository.save(user);

  return { message: 'Password berhasil diubah' };
}

async updateProfile(id: number, updateProfileDto: UpdateProfileDto){
  const user = await this.findOne(id)
  Object.assign(user, updateProfileDto)
  return await this.userRepository.save(user)
}

async deleteProfileIfExists(filename: string) {
    const fullPath = join('./uploads/images', filename);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return ; 
    }
  console.log('File not found in any folder.');
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException()
    }
    return await this.userRepository.remove(user)
  }

}
