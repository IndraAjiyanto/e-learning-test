import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Misi } from '../entities/misi.entity';
import { CreateMisiDto } from './dto/create-misi.dto';
import { UpdateMisiDto } from './dto/update-misi.dto';

@Injectable()
export class MisiService {
  constructor(
    @InjectRepository(Misi)
    private misiRepository: Repository<Misi>,
  ) {}

  async create(createMisiDto: CreateMisiDto): Promise<Misi> {
    const misi = this.misiRepository.create(createMisiDto);
    return this.misiRepository.save(misi);
  }

  async findAll(): Promise<Misi[]> {
    return this.misiRepository.find();
  }

  async findOne(id: number): Promise<Misi | null> {
    return this.misiRepository.findOneBy({ id });
  }

  async update(id: number, updateMisiDto: UpdateMisiDto): Promise<Misi | null> {
    await this.misiRepository.update(id, updateMisiDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.misiRepository.delete(id);
  }
}
