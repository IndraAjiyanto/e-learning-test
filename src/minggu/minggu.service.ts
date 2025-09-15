import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMingguDto } from './dto/create-minggu.dto';
import { UpdateMingguDto } from './dto/update-minggu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Minggu } from 'src/entities/minggu.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class MingguService {
    constructor(
      @InjectRepository(Minggu)
      private readonly mingguRepository: Repository<Minggu>,
  
      @InjectRepository(Kelas)
      private readonly kelasRepository: Repository<Kelas>,
  
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
    ){}

  async create(createMingguDto: CreateMingguDto, kelasId: number) {
    const kelas = await this.kelasRepository.findOne({where: {id : kelasId}})
    if(!kelas){
      throw new NotFoundException('kelas Not Found')
    }
    const minggu = await this.mingguRepository.findOne({where: {minggu_ke: createMingguDto.minggu_ke - 1, kelas: {id: kelas.id}}})

    if(!minggu?.akhir){
      if(createMingguDto.akhir_check === 'true'){
        createMingguDto.akhir = true
      }
    const data = await this.mingguRepository.create({
      ...createMingguDto,
      kelas: kelas
    })
    return await this.mingguRepository.save(data)
    }else{
      throw new Error('tidak dapat menambahkan pertemuan lagi')
    }
  }

    async noPertemuan(kelasId: number){
    const mingguTerakhir = await this.findMingguKelas(kelasId)
    const mingguBaru = mingguTerakhir + 1
    return mingguBaru
  }

    async findMingguKelas(kelasId: number){
    const minggu = await this.mingguRepository.findOne({where: {kelas: {id: kelasId}}, order: {createdAt: 'DESC'}})
    if(!minggu){
      return 0
    }
    return minggu.minggu_ke
  }

  findAll() {
    return `This action returns all minggu`;
  }

  async findOne(mingguId: number) {
    return await this.mingguRepository.findOne({where: {id: mingguId}, relations: ['pertemuan', 'quiz', 'kelas']})
  }

  async update(id: number, updateMingguDto: UpdateMingguDto) {
        const minggu = await this.findOne(id)
    if(!minggu){
      throw new NotFoundException('week not found');
    }

    if(updateMingguDto.akhir_check === 'true'){
        updateMingguDto.akhir = true
      }else{
        updateMingguDto.akhir = false
      }
    Object.assign(minggu, updateMingguDto)
    return await this.mingguRepository.save(minggu)
  }

  async remove(id: number, kelasId: number) {
        const minggu = await this.findOne(id)
    if(!minggu){
      throw new NotFoundException('week not found')
    }
    await this.mingguRepository.remove(minggu)
  const semuaMinggu = await this.mingguRepository.find({
    where: { kelas: { id: kelasId } },
    order: { createdAt: 'ASC' }
  });

  for (let i = 0; i < semuaMinggu.length; i++) {
    semuaMinggu[i].minggu_ke = i + 1;
    await this.mingguRepository.save(semuaMinggu[i]);
  }
  }
}
