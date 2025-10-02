import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJenisKelaDto } from './dto/create-jenis_kela.dto';
import { UpdateJenisKelaDto } from './dto/update-jenis_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class JenisKelasService {
  constructor(
            @InjectRepository(JenisKelas)
            private readonly jenisKelasRepository: Repository<JenisKelas>

  ){}
  async create(createJenisKelaDto: CreateJenisKelaDto) {
    const jenis_kelas = await this.jenisKelasRepository.create(createJenisKelaDto)
    return await this.jenisKelasRepository.save(jenis_kelas)
  }

  async findAll() {
    return await this.jenisKelasRepository.find()
  }

  async findOne(jenis_kelasId: number) {
    const jenis_kelas = await this.jenisKelasRepository.findOne({where: {id: jenis_kelasId}})
    if(!jenis_kelas){
          throw new NotFoundException('jenis kelas not found')
    }
    return jenis_kelas
  }

  async update(jenis_kelasId: number, updateJenisKelaDto: UpdateJenisKelaDto) {
        const jenis_kelas = await this.findOne(jenis_kelasId)
        if(!jenis_kelas){
          throw new NotFoundException('jenis kelas not found')
        }
        Object.assign(jenis_kelas, updateJenisKelaDto)
        return await this.jenisKelasRepository.save(jenis_kelas)
  }

  async remove(jenis_kelasId: number) {
        const jenis_kelas = await this.findOne(jenis_kelasId)
    if(!jenis_kelas){
      throw new NotFoundException()
    }
    return await this.jenisKelasRepository.remove(jenis_kelas)
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
