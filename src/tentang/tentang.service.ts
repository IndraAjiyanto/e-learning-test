import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTentangDto } from './dto/create-tentang.dto';
import { UpdateTentangDto } from './dto/update-tentang.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tentang } from 'src/entities/tentang.entity';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Translation } from 'src/entities/translation.entity';

@Injectable()
export class TentangService {
  constructor(
    @InjectRepository(Tentang)
    private tentangRepository: Repository<Tentang>,
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  async create(createTentangDto: CreateTentangDto) {
    const tentang_id = await this.tentangRepository.create({
      judul: createTentangDto.judul_id,
      text: createTentangDto.text_id,
      gambar: createTentangDto.gambar,
    });
    const tentangId  = await this.tentangRepository.save(tentang_id);

    const translation_id = await this.translationRepository.create({
      key: 'tentang',
      locale: 'id',
      tentang: tentangId,
    });
    await this.translationRepository.save(translation_id);

    const tentang_en = await this.tentangRepository.create({
      judul: createTentangDto.judul_en,
      text: createTentangDto.text_en,
      gambar: createTentangDto.gambar,
    });
    const tentangEn  = await this.tentangRepository.save(tentang_en);

    const translation_en = await this.translationRepository.create({
      key: 'tentang',
      locale: 'en',
      tentang: tentangEn,
    });
    await this.translationRepository.save(translation_en);

    const tentang_jp = await this.tentangRepository.create({
      judul: createTentangDto.judul_jp,
      text: createTentangDto.text_jp,
      gambar: createTentangDto.gambar,
    });
    const tentangJp  = await this.tentangRepository.save(tentang_jp); 
    const translation_jp = await this.translationRepository.create({
      key: 'tentang',
      locale: 'jp',
      tentang: tentangJp,
    });
    await this.translationRepository.save(translation_jp);
  }

  async findAll() {
    return await this.tentangRepository.find();
  }

  async findOne(id: number) {
    const tentang = await this.tentangRepository.findOne({ where: { id } });
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    return tentang;
  }

  async update(id: number, updateTentangDto: UpdateTentangDto) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    Object.assign(tentang, updateTentangDto);
    return await this.tentangRepository.save(tentang);
  }

  async remove(id: number) {
    const tentang = await this.findOne(id);
    if (!tentang) {
      throw new NotFoundException('Header not found');
    }
    return await this.tentangRepository.remove(tentang);
  }

  async getPublicIdFromUrl(imageUrl: string): Promise<string | null> {
    try {
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = parts.slice(-2, -1)[0];
      const fullPublicId = `${folder}/${publicId}`;

      await cloudinary.uploader.destroy(fullPublicId);
      return fullPublicId;
    } catch (error) {
      return null;
    }
  }
}
