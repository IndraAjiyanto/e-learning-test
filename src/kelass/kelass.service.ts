import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Absen } from 'src/entities/absen.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>, 
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Pertemuan)
        private readonly pertemuanRepository: Repository<Pertemuan>,
        @InjectRepository(Absen)
        private readonly absenRepository: Repository<Absen>,
  ){}

  async create(createKelassDto: CreateKelassDto) {
    const kelas = await this.kelasRepository.create(createKelassDto)
    return await this.kelasRepository.save(kelas)
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

async findMyCourse(userId: number) {
  const user = await this.userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return await this.kelasRepository.find({
    where: {
      user: { id: userId }  
    },
    relations: ['user'], 
  });
}

async findPertemuan(kelasId: number){
    const kelas = await this.findOne(kelasId);
  if (!kelas) {
    throw new NotFoundException(`User with ID ${kelasId} not found`);
  }
  return await this.pertemuanRepository.find({
    where: {
      kelas: { id: kelasId }
    },
    relations: ['kelas', 'absen.user'], 
  });
}

async findUser(){
  return await this.userRepository.find({where: {role: 'user'}})
}

// async findAbsen(kelasId: number, userId: number){
//   const pertemuan = await this.findPertemuan(kelasId); 
//   const absen = await this.absenRepository.find({where: {user: {id: userId}}});
// }

  async findAll() {
    return await this.kelasRepository.find()
  }

  async findMurid(id: number){
    return await this.userRepository.find({where: {kelas: {id: id}}})
  }

  async allKelas(){
   return await this.kelasRepository
  .createQueryBuilder("kelas")
  .loadRelationCountAndMap("kelas.jumlahPendaftar", "kelas.user")
  .getMany();
  }

  async findOne(id: number) {
    return await this.kelasRepository.findOne({where: {id}})
  }

  async update(id: number, updateKelassDto: UpdateKelassDto) {
    const kelas = await this.findOne(id)
    if(!kelas){
      throw new NotFoundException()
    }
    Object.assign(kelas, updateKelassDto)
    return await this.kelasRepository.save(kelas)
  }

  async remove(id: number) {
    const kelas = await this.findOne(id)
    if(!kelas){
      throw new NotFoundException()
    }
    return await this.kelasRepository.remove(kelas)
  }

    async removeUserKelas(userId:number, kelasId:number){
    return await this.kelasRepository  
    .createQueryBuilder()
  .relation(Kelas, "user")
  .of(kelasId)
  .remove(userId);
  }
}
