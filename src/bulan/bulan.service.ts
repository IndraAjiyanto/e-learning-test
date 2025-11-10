import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBulanDto } from './dto/create-bulan.dto';
import { UpdateBulanDto } from './dto/update-bulan.dto';
import { Bulan } from 'src/entities/bulan.entity';

@Injectable()
export class BulanService {
  constructor(
    @InjectRepository(Bulan)
    private readonly bulanRepository: Repository<Bulan>,
  ) {}

  async create(createBulanDto: CreateBulanDto) {
    const ent = this.bulanRepository.create(createBulanDto);
    return await this.bulanRepository.save(ent);
  }

  async findAll() {
    return await this.bulanRepository.find({ relations: ['kelas'] });
  }

  async findOne(id: number) {
    return await this.bulanRepository.findOne({
      where: { id },
      relations: ['kelas'],
    });
  }

  async update(id: number, updateBulanDto: UpdateBulanDto) {
    await this.bulanRepository.update(id, updateBulanDto);
  }

  async remove(id: number) {
    return await this.bulanRepository.delete(id);
  }
}
