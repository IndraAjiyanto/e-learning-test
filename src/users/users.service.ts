import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as bcrypt from "bcrypt";
import { UpdatePasswordDto } from './dto/update-password.dto';

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
    return await this.userRepository.findOne({where: {id}})
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
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

  async remove(id: number) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException()
    }
    return await this.userRepository.remove(user)
  }

}
