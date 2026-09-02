import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisiDto } from './dto/create-visi.dto';
import { UpdateVisiDto } from './dto/update-visi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Visi } from 'src/entities/visi.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisiService {
  constructor(
    @InjectRepository(Visi)
    private readonly visiRepository: Repository<Visi>,
  ) {}

  async create(createVisiDto: CreateVisiDto) {
    const visi = await this.visiRepository.create(createVisiDto);
    return await this.visiRepository.save(visi);
  }

  async findAll() {
    return await this.visiRepository.find();
  }

  async findOne(visiId: number) {
    const visi = await this.visiRepository.findOne({
      where: { id: visiId },
    });
    if (!visi) {
      throw new NotFoundException('Visi not found');
    }
    return visi;
  }

  async update(visiId: number, updateVisiDto: UpdateVisiDto) {
    const visi = await this.findOne(visiId);
    Object.assign(visi, updateVisiDto);
    return await this.visiRepository.save(visi);
  }

  async remove(visiId: number) {
    const visi = await this.findOne(visiId);
    return await this.visiRepository.remove(visi);
  }
}
