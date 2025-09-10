import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { join } from 'path';
import * as fs from 'fs';

const foldersToSearch = [
  './uploads/pdf',
  './uploads/images',
  './uploads/videos',
  './uploads/ppt',
];

@Injectable()
export class TugassService {
      @InjectRepository(Tugas)
      private readonly tugasRepository: Repository<Tugas>
      @InjectRepository(Pertemuan)
      private readonly pertemuanRepository: Repository<Pertemuan>
      
  async create(createTugassDto: CreateTugassDto) {
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: createTugassDto.pertemuanId}})
    if(!pertemuan){
        throw new NotFoundException('pertemuan ini tidak ada')
    }
            const tugas = await this.tugasRepository.create({
          ...createTugassDto,
          pertemuan: pertemuan,
        })
        return await this.tugasRepository.save(tugas)
  }

  findAll() {
    return `This action returns all tugass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tugass`;
  }

  update(id: number, updateTugassDto: UpdateTugassDto) {
    return `This action updates a #${id} tugass`;
  }

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

  async remove(tugasId: number) {
    const tugas = await this.tugasRepository.findOne({where: {id: tugasId}})
    if(!tugas){
      throw new NotFoundException('tugas tidak ditemukan')
    }
    await this.deleteFileIfExists(tugas.file)
    await this.tugasRepository.remove(tugas)
  }
}
