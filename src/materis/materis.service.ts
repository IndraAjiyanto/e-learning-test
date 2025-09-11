import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisFile, Materi } from 'src/entities/materi.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import * as fs from 'fs';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { Pertemuan } from 'src/entities/pertemuan.entity';

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
      where: { pertemuan: {id: pertemuanId} },
      relations: ['pertemuan']  
    })
  }

  async findMateriPdf(pertemuanId: number){
    return await this.materiRepository.find({
      where: {pertemuan:{id:pertemuanId}, jenis_file: "pdf"}
    })
  }

async findMateriPpt(pertemuanId: number) {
  const materiList = await this.materiRepository.find({
    where: { pertemuan: { id: pertemuanId }, jenis_file: "ppt" }
  });

  return materiList;
}


async findPertemuan(pertemuanId: number){
  return await this.pertemuanRepository.findOne({where: {id: pertemuanId}, relations: ['kelas', 'absen', 'materi', 'tugas']})
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

  async update(id: number, updateMaterisDto: UpdateMaterisDto) {
    const materi = await this.findOne(id)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan');
    }
    Object.assign(materi, updateMaterisDto)
    return await this.materiRepository.save(materi)
  }

  async remove(materiId: number) {
    const materi = await this.findOne(materiId)
    if(!materi){
      throw new NotFoundException('materi tidak ditemukan')
    }
    await this.getPublicIdFromUrl(materi.file)
    return await this.materiRepository.remove(materi)
  }
}
