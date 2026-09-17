import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisionsDto } from './dto/create-vision.dto';
import { UpdateVisionsDto } from './dto/update-vision.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vision } from 'src/entities/visions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisionsService {
  constructor(
    @InjectRepository(Vision)
    private readonly visionRepository: Repository<Vision>,
  ) {}

  async create(createVisionDto: CreateVisionsDto) {
    const vision = await this.visionRepository.create(createVisionDto);
    return await this.visionRepository.save(vision);
  }

  async findAll() {
    // Urutan harus eksplisit: tanpa ini Postgres mengembalikan baris sesuai
    // urutan fisiknya, dan sebuah UPDATE memindahkan baris yang diedit ke
    // belakang — daftar teracak dan nomor barisnya ikut berubah (lihat TC-045).
    return await this.visionRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(visionId: string) {
    const vision = await this.visionRepository.findOne({
      where: { id: visionId },
    });
    if (!vision) {
      throw new NotFoundException('Vision not found');
    }
    return vision;
  }

  async update(visionId: string, updateVisionDto: UpdateVisionsDto) {
    const vision = await this.findOne(visionId);
    Object.assign(vision, updateVisionDto);
    return await this.visionRepository.save(vision);
  }

  async remove(visionId: string) {
    const vision = await this.findOne(visionId);
    return await this.visionRepository.remove(vision);
  }
}
