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
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const cekEmail = await this.userRepository.findOne({where: {email: createUserDto.email}})
    if(!cekEmail){
    const user = await this.userRepository.create(createUserDto)
    return await this.userRepository.save(user)
    }else{
      throw new NotFoundException()

    }

  }

    async findByEmail(email: string): Promise<User | null>{
    return this.userRepository.findOne({where: {email}, relations: ['kelas', 'absen']});
  }

  async findAll() {
    return await this.userRepository.find({where: {email: Not('super@gmail.com')}})
  }

  async findOne(userId: number) {
    const user = await this.userRepository.findOne({where: {id: userId}, relations: ['biodata']})
    if(!user){
      throw new NotFoundException()
    }
    return user
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(userId)
    if(!user){
      throw new NotFoundException()
    }
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

async updateProfile(userId: number, updateProfileDto: UpdateProfileDto){
  const user = await this.findOne(userId)
  Object.assign(user, updateProfileDto)
  return await this.userRepository.save(user)
}


async getPublicIdFromUrl(url: string) {
  // Pisahkan berdasarkan "/upload/"
  const parts = url.split('/upload/');
  if (parts.length < 2) {
    return null;
  }

  // Ambil bagian setelah upload/
  let path = parts[1];

  // Hapus "v1234567890/" (versi auto Cloudinary)
  path = path.replace(/^v[0-9]+\/?/, '');

  // Buang extension (.jpg, .png, .pdf, dll)
  path = path.replace(/\.[^.]+$/, '');

  console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan

  await this.deleteFileIfExists(path);
}

async deleteFileIfExists(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'not found') {
      console.log('File not found in Cloudinary.');
    } else {
      console.log('File deleted from Cloudinary:', result);
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
}


  async remove(id: number) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException()
    }
    return await this.userRepository.remove(user)
  }

}
