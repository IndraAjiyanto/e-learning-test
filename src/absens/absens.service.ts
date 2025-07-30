import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Absen } from 'src/entities/absen.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AbsensService {
  constructor (
    @InjectRepository(Absen)
    private readonly absenRepository: Repository<Absen>,

    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(CreateAbsenDto: CreateAbsenDto) {
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: CreateAbsenDto.pertemuanId}})
    const user = await this.userRepository.findOne({where: {id: CreateAbsenDto.userId}})
    if(!pertemuan){
      throw new NotFoundException('pertemuan ini tidak ada')
    }
    if(!user){
      throw new NotFoundException('user ini tidak ada')
    }
    const absen = await this.absenRepository.create({
      ...CreateAbsenDto,
      pertemuan: pertemuan,
      user: user
    })
    return await this.absenRepository.save(absen)
  }

  async findAll() {
      return await this.absenRepository.find({
      relations: ['pertemuan','user']
    })
  }

  async findOne(id: number) {
    const absen = await this.absenRepository.findOne({
      where: {id},
      relations: ['pertemuan','user']
    })
    if (!absen) {
      throw new NotFoundException(`absen tidak ditemukan`);
    }

    if (!absen.pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    if (!absen.user) {
      throw new NotFoundException('user tidak ditemukan');
    }
    return absen;
  }

  async update(id: number, updateAbsenDto: UpdateAbsenDto) {
    const absen = await this.findOne(id)
    if(!absen){
      throw new NotFoundException('absen tidak ditemukan');
    }
    Object.assign(absen, updateAbsenDto)
    return await this.absenRepository.save(absen)
  }

  async remove(id: number) {
    const absen = await this.findOne(id)
    if(!absen){
      throw new NotFoundException('absen tidak ditemukan')
    }
    return await this.absenRepository.remove(absen)
  }
}
