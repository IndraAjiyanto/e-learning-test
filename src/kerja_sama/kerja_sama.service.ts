import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKerjaSamaDto } from './dto/create-kerja_sama.dto';
import { UpdateKerjaSamaDto } from './dto/update-kerja_sama.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class KerjaSamaService {
    constructor(
              @InjectRepository(KerjaSama)
              private readonly kerjaSamaRepository: Repository<KerjaSama>
    ){}

  async create(createKerjaSamaDto: CreateKerjaSamaDto) {
    const kerja_sama = await this.kerjaSamaRepository.create(createKerjaSamaDto)
    return await this.kerjaSamaRepository.save(kerja_sama)
  }

  async findAll() {
    return await this.kerjaSamaRepository.find()
  }

  async findOne(kerja_samaId: number) {
    const kerja_sama = await this.kerjaSamaRepository.findOne({where: {id: kerja_samaId}})
    if(!kerja_sama){
      throw new NotFoundException('kerja sama not found')
    }
    return kerja_sama
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

  async update(kerja_samaId: number, updateKerjaSamaDto: UpdateKerjaSamaDto) {
    const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException('kerja sama not found');
    }
    Object.assign(kerja_sama, updateKerjaSamaDto);
    return await this.kerjaSamaRepository.save(kerja_sama);
  }

  async remove(kerja_samaId: number) {
        const kerja_sama = await this.findOne(kerja_samaId);
    if (!kerja_sama) {
      throw new NotFoundException();
    }
    return await this.kerjaSamaRepository.remove(kerja_sama);
  }
}
