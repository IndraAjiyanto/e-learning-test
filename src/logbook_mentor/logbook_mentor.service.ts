import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class LogbookMentorService {
    @InjectRepository(LogbookMentor)
    private readonly logBookMentorRepository: Repository<LogbookMentor>
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  async create(createLogbookMentorDto: CreateLogbookMentorDto) {
        const user = await this.userRepository.findOne({where: {id: createLogbookMentorDto.userId}})
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: createLogbookMentorDto.pertemuanId}})
    if(!user){
        throw new Error('User tidak ada');
    }
    if(!pertemuan){
        throw new Error('pertemuan tidak ada');
    }
    const logbook = await this.logBookMentorRepository.create({
      ...createLogbookMentorDto,
      user: user,
      pertemuan: pertemuan
    })
    return await this.logBookMentorRepository.save(logbook)
  }

  async findAll() {
    return await this.logBookMentorRepository.find({relations: ['user', 'pertemuan', 'pertemuan.minggu', 'pertemuan.minggu.kelas']})
    }

  async findOne(logbook_mentorId: number) {
    const logbook_mentor = await this.logBookMentorRepository.findOne({where: {id: logbook_mentorId}, relations: ['pertemuan', 'user']})
    if(!logbook_mentor){
      throw new NotFoundException('logbook not found')
    }
    return logbook_mentor
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

  async update(logbook_mentorId: number, updateLogbookMentorDto: UpdateLogbookMentorDto) {
            const logbook = await this.findOne(logbook_mentorId)
        if(!logbook){
          throw new NotFoundException('logbook not found')
        }
        Object.assign(logbook, updateLogbookMentorDto)
        return await this.logBookMentorRepository.save(logbook)
  }

  remove(id: number) {
    return `This action removes a #${id} logbookMentor`;
  }
}
