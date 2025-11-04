import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeknologiDto } from './dto/create-teknologi.dto';
import { UpdateTeknologiDto } from './dto/update-teknologi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Teknologi } from 'src/entities/teknologi.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeknologiService {
  constructor(
    @InjectRepository(Teknologi)
    private readonly teknologiRepository: Repository<Teknologi>,
  ) {}

  async create(createTeknologiDto: CreateTeknologiDto) {
    const teknologi = this.teknologiRepository.create(createTeknologiDto);
    return await this.teknologiRepository.save(teknologi);
  }

  async findAll() {
    return await this.teknologiRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const teknologi = await this.teknologiRepository.findOne({
      where: { id },
    });
    if (!teknologi) {
      throw new NotFoundException('Teknologi not found');
    }
    return teknologi;
  }

  async update(id: number, updateTeknologiDto: UpdateTeknologiDto) {
    const teknologi = await this.findOne(id);
    if (!teknologi) {
      throw new NotFoundException('Teknologi tidak ditemukan');
    }

    Object.assign(teknologi, updateTeknologiDto);
    return await this.teknologiRepository.save(teknologi);
  }

  async remove(id: number) {
    const teknologi = await this.findOne(id);
    if (!teknologi) {
      throw new NotFoundException();
    }
    return await this.teknologiRepository.remove(teknologi);
  }
}
