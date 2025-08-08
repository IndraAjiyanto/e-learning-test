import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisFile, Materi } from 'src/entities/materi.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as fs from 'fs';
import { join } from 'path';
import { Pertemuan } from 'src/entities/pertemuan.entity';

const foldersToSearch = [
  './uploads/pdf',
  './uploads/images',
  './uploads/videos',
  './uploads/ppt',
];

@Injectable()
export class MaterisService {
  constructor(
    @InjectRepository(Materi)
    private readonly materiRepository: Repository<Materi>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>
  ){}
  async create(createMaterisDto: CreateMaterisDto) {
        const pertemuan = await this.pertemuanRepository.findOne({where: {id: createMaterisDto.pertemuanId}})
        if(!pertemuan){
          throw new NotFoundException('pertemuan ini tidak ada')
        }
        const materi = await this.materiRepository.create({
          ...createMaterisDto,
          pertemuan: pertemuan,
        })
        return await this.materiRepository.save(materi)
  }

  async findMateriBypertemuan(pertemuanId: number){
    return await this.materiRepository.find({
      where: {pertemuan: {id: pertemuanId}},
      relations: ['pertemuan']  
    })
  }

  async findMateriPdf(pertemuanId: number){
    return await this.materiRepository.find({
      where: {pertemuan:{id:pertemuanId}, jenis_file: "pdf"}
    })
  }

  async findMateriPpt(pertemuanId: number){
    return await this.materiRepository.find({
      where: {pertemuan:{id:pertemuanId}, jenis_file: "ppt"}
    })
  }

  async findMateriVideo(pertemuanId: number){
    return await this.materiRepository.find({
      where: {pertemuan:{id:pertemuanId}, jenis_file: "video"}
    })
  }

  async findPertemuanByKelas(kelasId: number){
    const pertemuan = await this.pertemuanRepository.find({
    where: { kelas: { id: kelasId } },
    relations: ['materi'], 
    order: { id: 'ASC' } 
  });

  return pertemuan.map(p => ({
    ...p,
    materiPdf: p.materi.filter(m => m.jenis_file === 'pdf'),
    materiVideo: p.materi.filter(m => m.jenis_file === 'video'),
    materiPpt: p.materi.filter(m => m.jenis_file === 'ppt'),
  }));
  }

  async findMateriByJenisAndPertemuan(kelasId: number, jenis_file: JenisFile){
    return await this.materiRepository.find({where: {jenis_file: jenis_file, pertemuan: {kelas: {id: kelasId}}}, })

  }

  async findIdentityMateri(jenis_file: JenisFile, pertemuanId: number) {
      return await this.materiRepository.find({
      where: {jenis_file: jenis_file, pertemuan: {id: pertemuanId}},
      relations: ['pertemuan'],
    });
  }

  async findOne(id: number) {
      const materi = await this.materiRepository.findOne({
      where: {id},
      relations: ['pertemuan']
    })
    if (!materi) {
      throw new NotFoundException(`materi tidak ditemukan`);
    }

    if (!materi.pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    return materi;
  }

  // async findMateri(id: number){
  //   return await this.materiRepository.find({
  //     where: {id}
  //   })
  // }

  // async findMateri(id: number){
  //     return await this.materiRepository.find({
  //     select: ['jenis_file'],
  //     where: {id},
  //     relations: ['kelas']
  //   })
  // }


async deleteFileIfExists(filename: string) {
  for (const folder of foldersToSearch) {
    const fullPath = join(folder, filename);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return; 
    }
  }

  console.log('File not found in any folder.');
}

  async update(id: number, updateMaterisDto: UpdateMaterisDto) {
    const materi = await this.findOne(id)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan');
    }
    Object.assign(materi, updateMaterisDto)
    return await this.materiRepository.save(materi)
  }

  async remove(id: number) {
    const materi = await this.findOne(id)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan')
    }
    await this.deleteFileIfExists(materi.file)
    return await this.materiRepository.remove(materi)
  }
}
