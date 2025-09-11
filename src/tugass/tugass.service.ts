import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tugas } from 'src/entities/tugas.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { v2 as cloudinary } from 'cloudinary';

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

  async remove(tugasId: number) {
    const tugas = await this.tugasRepository.findOne({where: {id: tugasId}})
    if(!tugas){
      throw new NotFoundException('tugas tidak ditemukan')
    }
    await this.getPublicIdFromUrl(tugas.file)
    await this.tugasRepository.remove(tugas)
  }
}
