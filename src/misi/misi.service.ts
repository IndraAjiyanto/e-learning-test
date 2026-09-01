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
    return await this.misiRepository.save(misi);
  }

  async findAll(): Promise<Misi[]> {
    return await this.misiRepository.find();
  }

  async noPertemuan() {
    const misi_old = await this.misiRepository.find({
      order: { misi_ke: 'DESC' },
      take: 1,
    });
    if (!misi_old || misi_old.length === 0) {
      return 0;
    }
    const misi_new = misi_old[0].misi_ke + 1;
    return misi_new;
  }

  async findOne(id: string): Promise<Misi | null> {
    return await this.misiRepository.findOneBy({ id });
  }

  async update(id: string, updateMisiDto: UpdateMisiDto): Promise<Misi | null> {
    await this.misiRepository.update(id, updateMisiDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const misi = await this.findOne(id);
    if (!misi) {
      throw new Error('Misi not found');
    }
    await this.misiRepository.remove(misi);
    const allMisi = await this.misiRepository.find();
    for (const item of allMisi) {
      if (item.misi_ke > misi.misi_ke) {
        item.misi_ke -= 1;
        await this.misiRepository.save(item);
      }
    }
  }
}
