import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

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

async addUserToKelas(userId: number, kelasId: number): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['kelas'],
  });

  if (!user) {
    throw new NotFoundException('User tidak ada');
  }

  const kelas = await this.kelasRepository.findOneBy({ id: kelasId });
  if (!kelas) {
    throw new NotFoundException('Kelas tidak ada');
  }

  const sudahGabung = user.kelas.some((k) => k.id === kelas.id);
  if (sudahGabung) {
    throw new BadRequestException('User sudah tergabung dalam kelas');
  }

  user.kelas.push(kelas);
  return await this.userRepository.save(user);
}


  async findAll() {
    return await this.userRepository.find()
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

  async remove(id: number) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException()
    }
    return await this.userRepository.remove(user)
  }
}
