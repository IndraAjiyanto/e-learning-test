import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alumni } from 'src/entities/alumni.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class AlumniService {
  constructor(
        @InjectRepository(Alumni)
        private readonly alumniRepository: Repository<Alumni>,
        @InjectRepository(Kelas)
        private readonly kelasRepository: Repository<Kelas>,
  ){}
  async create(createAlumnusDto: CreateAlumnusDto) {
    const alumni = await this.alumniRepository.create(createAlumnusDto)
    await this.alumniRepository.save(alumni)
  }

  async findAll() {
    return await this.alumniRepository.find({relations: ['kelas']});
  }

  async findOne(alumniId: number) {
    const alumni = await this.alumniRepository.findOne({where: {id: alumniId}})
    if(!alumni){
      throw new NotFoundException('alumni Not found')
    }
    return alumni
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

  async update(alumniId: number, updateAlumnusDto: UpdateAlumnusDto) {
    const alumni = await this.findOne(alumniId)
    if(!alumni){
      throw new NotFoundException('alumni tidak ditemukan')
    }

  Object.assign(alumni, updateAlumnusDto);

  return await this.alumniRepository.save(alumni);
  }

  async remove(alumniId: number) {
    return `This action removes a #${alumniId} alumnus`;
  }
}
