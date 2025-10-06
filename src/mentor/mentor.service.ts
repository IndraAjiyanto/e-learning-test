import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class MentorService {
    constructor(
      @InjectRepository(Mentor)
      private readonly mentorRepository: Repository<Mentor>,
      @InjectRepository(Kelas)
      private readonly kelasRepository: Repository<Kelas>
    ){}

  async create(createMentorDto: CreateMentorDto) {
    const kelas = await this.kelasRepository.findOne({where: {id:createMentorDto.kelasId}})
    if(!kelas){
      throw new NotFoundException('kelas not found')
    }
    const mentor = await this.mentorRepository.create({
      ...createMentorDto,
      kelas: kelas
    })
    return await this.mentorRepository.save(mentor)
  }

  async findOne(mentorId: number) {
    const mentor = await this.mentorRepository.findOne({where: {id: mentorId}, relations: ['kelas']})
    if(!mentor){
      throw new NotFoundException('mentor not found')
    }
    return mentor
  }

  async update(mentorId: number, updateMentorDto: UpdateMentorDto) {
    const mentor = await this.findOne(mentorId)
    if(!mentor){
      throw new NotFoundException('kelas not found')
    }
    Object.assign(mentor, updateMentorDto)
    return await this.mentorRepository.save(mentor)
  }

  async remove(mentorId: number) {
        const mentor = await this.findOne(mentorId)
    if(!mentor){
      throw new NotFoundException('kelas not found')
    }
    return await this.mentorRepository.remove(mentor)
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

}
