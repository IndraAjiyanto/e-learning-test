import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlurKelaDto } from './dto/create-alur_kela.dto';
import { UpdateAlurKelaDto } from './dto/update-alur_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Repository } from 'typeorm';
import { Kategori } from 'src/entities/kategori.entity';

@Injectable()
export class AlurKelasService {
        constructor(
          @InjectRepository(AlurKelas)
          private readonly alurKelasRepository: Repository<AlurKelas>,
          @InjectRepository(Kategori)
          private readonly kategoriRepository: Repository<Kategori>
        ) {}

  async create(createAlurKelaDto: CreateAlurKelaDto) {
    const kategori = await this.kategoriRepository.findOne({where: {id:createAlurKelaDto.kategoriId}})
    if(!kategori){
      throw new NotFoundException('kategori not found')
    }
    const alur_kelas = this.alurKelasRepository.create({
      ...createAlurKelaDto,
      kategori: kategori
    })
    return await this.alurKelasRepository.save(alur_kelas)
  }

  async noAlur(kategoriId: number){
    const alurTerakhir = await this.findAlurKelas(kategoriId)
    const aluBaru = alurTerakhir + 1
    return aluBaru
  }

  async findAlurKelas(kategoriId: number){
    const alur_kelas = await this.alurKelasRepository.findOne({where: {kategori: {id: kategoriId}}, order: {alur_ke: 'DESC'}})
    if(!alur_kelas){
      return 0
    }
    return alur_kelas.alur_ke
  }

  findAll() {
    return `This action returns all alurKelas`;
  }

  async findOne(alurKelasId: number) {
    const alur_kelas = await this.alurKelasRepository.findOne({where: {id: alurKelasId}, relations:['kategori']})
    if(!alur_kelas){
      throw new NotFoundException('alur kelas not found')
    }
    return alur_kelas
  }

  async update(alurKelasId: number, updateAlurKelaDto: UpdateAlurKelaDto) {
            const alur_kelas = await this.findOne(alurKelasId)
    if(!alur_kelas){
      throw new NotFoundException('alur kelas not found');
    }

    Object.assign(alur_kelas, updateAlurKelaDto)
    return await this.alurKelasRepository.save(alur_kelas)
  }

  async remove(alurKelasId: number, kategoriId) {
            const alur_kelas = await this.findOne(alurKelasId)
    if(!alur_kelas){
      throw new NotFoundException('alur kelas not found')
    }
    await this.alurKelasRepository.remove(alur_kelas)
  const semua_alur_kelas = await this.alurKelasRepository.find({
    where: { kategori: { id: kategoriId } },
    order: { createdAt: 'ASC' }
  });

  for (let i = 0; i < semua_alur_kelas.length; i++) {
    semua_alur_kelas[i].alur_ke = i + 1;
    await this.alurKelasRepository.save(semua_alur_kelas[i]);
  }
  }
}
