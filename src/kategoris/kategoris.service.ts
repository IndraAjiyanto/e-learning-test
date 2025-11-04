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

    async create(createKategorisDto: CreateKategorisDto) {
    const kategori = await this.kategoriRepository.create(createKategorisDto);
    return await this.kategoriRepository.save(kategori);
  }

  async findAll() {
    return await this.kategoriRepository.find()
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

  async remove(kategoriId: number) {
    const kategori =  await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException();
    }
    await this.kategoriRepository.remove(kategori);
    return {message: 'kategori successfully deleted'
  };
  }
}
