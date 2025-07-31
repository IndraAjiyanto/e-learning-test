import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisFile, Materi } from 'src/entities/materi.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as fs from 'fs';
import { join } from 'path';

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
    private readonly kelasRepository: Repository<Kelas>
  ){}
  async create(createMaterisDto: CreateMaterisDto) {
        const kelas = await this.kelasRepository.findOne({where: {id: createMaterisDto.kelasId}})
        if(!kelas){
          throw new NotFoundException('kelas ini tidak ada')
        }
        const materi = await this.materiRepository.create({
          ...createMaterisDto,
          kelas: kelas,
        })
        return await this.materiRepository.save(materi)
  }

  async findMateriBykelas(kelasId: number){
    return await this.materiRepository.find({
      where: {kelas: {id: kelasId}},
      relations: ['kelas']  
    })
  }

  async findIdentityMateri(jenis_file: JenisFile, kelasId: number) {
      return await this.materiRepository.find({
      where: {jenis_file: jenis_file, kelas: {id: kelasId}},
      relations: ['kelas'],
    });
  }

  async findOne(id: number) {
      const materi = await this.materiRepository.findOne({
      where: {id},
      relations: ['kelas']
    })
    if (!materi) {
      throw new NotFoundException(`materi tidak ditemukan`);
    }

    if (!materi.kelas) {
      throw new NotFoundException('kelas tidak ditemukan');
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
