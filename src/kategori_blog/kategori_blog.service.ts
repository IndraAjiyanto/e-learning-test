import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategoriBlogDto } from './dto/create-kategori_blog.dto';
import { UpdateKategoriBlogDto } from './dto/update-kategori_blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KategoriBlogService {
  constructor(
    @InjectRepository(KategoriBlog)
    private readonly kategoriBlogRepository: Repository<KategoriBlog>,
  ) {}

  async create(createKategoriBlogDto: CreateKategoriBlogDto) {
    const kategori = this.kategoriBlogRepository.create(createKategoriBlogDto);
    return await this.kategoriBlogRepository.save(kategori);
  }

  async findAll() {
    return await this.kategoriBlogRepository.find({
      relations: ['blog'],
    });
  }

  async findOne(id: number) {
    const kategori = await this.kategoriBlogRepository.findOne({
      where: { id },
      relations: ['blog'],
    });
    if (!kategori) {
      throw new NotFoundException('Kategori Blog not found');
    }
    return kategori;
  }

  async update(id: number, updateKategoriBlogDto: UpdateKategoriBlogDto) {
    const kategori = await this.findOne(id);
    if (!kategori) {
      throw new NotFoundException('Kategori Blog not found');
    }

        Object.assign(kategori, updateKategoriBlogDto);
        return await this.kategoriBlogRepository.save(kategori);
    }

  async remove(id: number) {
    const kategori = await this.findOne(id);
    if (!kategori) {
      throw new NotFoundException('Kategori Blog not found');
    }
    return await this.kategoriBlogRepository.remove(kategori);
  }
}
