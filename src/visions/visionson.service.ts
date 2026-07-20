import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisionsDto } from './dto/create-vision.dto';
import { UpdateVisionsDto } from './dto/update-vision.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vision } from 'src/entities/visions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisionsonService {
  constructor(
    @InjectRepository(Vision)
    private readonly visionRepository: Repository<Vision>,
  ) { }

  async create(createVisionDto: CreateVisionsDto) {
    const vision = await this.visionRepository.create(createVisionDto);
    return await this.visionRepository.save(vision);
  }

  async findAll() {
    return await this.visionRepository.find();
  }

  async findOne(visionId: number) {
    const vision = await this.visionRepository.findOne({
      where: { id: visionId },
    });
    if (!vision) {
      throw new NotFoundException('Vision not found');
    }
    return vision;
  }

  async update(visionId: number, updateVisionDto: UpdateVisionsDto) {
    const vision = await this.findOne(visionId);
    Object.assign(vision, updateVisionDto);
    return await this.visionRepository.save(vision);
  }

  async remove(visionId: number) {
    const vision = await this.findOne(visionId);
    return await this.visionRepository.remove(vision);
  }
}
