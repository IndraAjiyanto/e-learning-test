import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import cloudinary from 'src/common/config/multer.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';
import { Repository } from 'typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';

@Injectable()
export class KategorisService {
    constructor(
      @InjectRepository(Kategori)
      private readonly kategoriRepository: Repository<Kategori>,
      @InjectRepository(AlurKelas)
      private readonly alurKelasRepository: Repository<AlurKelas>
    ){}

  async findAll() {
    return await this.kategoriRepository.find()
  }

  async findAlurKelas(kategoriId: number){
    return await this.alurKelasRepository.find({where: {kategori: {id: kategoriId} }, order: {alur_ke: 'ASC'}})
  }

  async findOne(kategoriId: number) {
    const kategori = await this.kategoriRepository.findOne({where: {id: kategoriId}})
    if(!kategori){
      throw new NotFoundException('kategori not found')
    }
    return kategori
  }

  async update(kategoriId: number, updateKategorisDto: UpdateKategorisDto) {
    const kategori = await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException();
    }
    Object.assign(kategori, updateKategorisDto);
    return await this.kategoriRepository.save(kategori);
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
