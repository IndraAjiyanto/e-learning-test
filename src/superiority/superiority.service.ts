import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Superiority } from '../entities/superiority.entity';
import { CreateSuperiorityDto } from './dto/create-superiority.dto';
import { UpdateSuperiorityDto } from './dto/update-superiority.dto';
import { Kategori } from '../entities/kategori.entity';

@Injectable()
export class SuperiorityService {
  constructor(
    @InjectRepository(Superiority)
    private superiorityRepository: Repository<Superiority>,
    @InjectRepository(Kategori)
    private kategoriRepository: Repository<Kategori>,
  ) {}

  async create(createSuperiorityDto: CreateSuperiorityDto) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createSuperiorityDto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('Kategori not found');
    }
    const superiority = await this.superiorityRepository.create({
      ...createSuperiorityDto,
      kategori,
    });
    return await this.superiorityRepository.save(superiority);
  }

  async findOne(id: string) {
    const superiority = await this.superiorityRepository.findOne({
      where: { id },
      relations: ['kategori'],
    });
    if (!superiority) {
      throw new NotFoundException('Superiority not found');
    }
    return superiority;
  }

  async update(id: string, updateSuperiorityDto: UpdateSuperiorityDto) {
    const superiority = await this.findOne(id);
    if (updateSuperiorityDto.kategoriId) {
      const kategori = await this.kategoriRepository.findOne({
        where: { id: updateSuperiorityDto.kategoriId },
      });
      if (!kategori) {
        throw new NotFoundException('Kategori not found');
      }
      superiority.kategori = kategori;
    }
    Object.assign(superiority, updateSuperiorityDto);
    return await this.superiorityRepository.save(superiority);
  }

  async remove(id: string) {
    const superiority = await this.findOne(id);
    return await this.superiorityRepository.remove(superiority);
  }
}
