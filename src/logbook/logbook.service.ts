import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class LogbookService {
  @InjectRepository(Logbook)
  private readonly logBookRepository: Repository<Logbook>
  @InjectRepository(User)
  private readonly userRepository: Repository<User>
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>
  @InjectRepository(Kelas)
  private readonly kelasRepository: Repository<Kelas>

  async create(createLogbookDto: CreateLogbookDto) {
    const user = await this.userRepository.findOne({where: {id: createLogbookDto.userId}})
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: createLogbookDto.pertemuanId}})
    if(!user){
        throw new Error('User tidak ada');
    }
    if(!pertemuan){
        throw new Error('pertemuan tidak ada');
    }
    const logbook = await this.logBookRepository.create({
      ...createLogbookDto,
      user: user,
      pertemuan: pertemuan
    })
    return await this.logBookRepository.save(logbook)
  }

  async findByUser(userId: number){
    return await this.logBookRepository.find({where: {user: {id: userId}}, relations: ['user']})
  }

  async findKelasByUser(userId: number){
    return await this.kelasRepository.find({where: {user_kelas: {user :{id: userId}}}, relations: ['user_kelas','user_kelas.user','minggu']})
  }

  async findAll() {
    return await this.logBookRepository.find({where: {user: {role: 'user'}}, relations: [ 'user']})
  }

  async findPertemuan(pertemuanId: number){
    const pertemuan = await this.pertemuanRepository.findOne({where: {id: pertemuanId}, relations: ['minggu', 'minggu.kelas']})
    if(!pertemuan){
      throw new NotFoundException('Session not found')
    }
    return pertemuan
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

  async findOne(logbookId: number) {
    const logbook = await this.logBookRepository.findOne({where: {id: logbookId},relations: ['pertemuan', 'pertemuan.minggu', 'pertemuan.minggu.kelas']})
    if(!logbook){
      throw new NotFoundException('log book not found')
    }
    return logbook
  }

  async update(logbookId: number, updateLogbookDto: UpdateLogbookDto) {
        const logbook = await this.findOne(logbookId)
        if(!logbook){
          throw new NotFoundException('logbook not found')
        }
        Object.assign(logbook, updateLogbookDto)
        return await this.logBookRepository.save(logbook)
  }

  remove(id: number) {
    return `This action removes a #${id} logbook`;
  }
}
