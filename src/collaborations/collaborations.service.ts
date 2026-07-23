import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollaborationsDto } from './dto/create-collaborations.dto';
import { UpdateCollaborationsDto } from './dto/update-collaborations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Collaboration } from 'src/entities/collaboration.entity';

@Injectable()
export class CollaborationsService {
  constructor(
    @InjectRepository(Collaboration)
    private readonly kerjaSamaRepository: Repository<Collaboration>,
  ) {}

  async create(createCollaborationsDto: CreateCollaborationsDto) {
    const collaborations =
      await this.kerjaSamaRepository.create(createCollaborationsDto);
    return await this.kerjaSamaRepository.save(collaborations);
  }

  async findAll() {
    return await this.kerjaSamaRepository.find();
  }

  async findOne(collaborationsId: number) {
    const collaborations = await this.kerjaSamaRepository.findOne({
      where: { id: collaborationsId },
    });
    if (!collaborations) {
      throw new NotFoundException('partnership not found');
    }
    return collaborations;
  }

  async update(collaborationsId: number, updateKerjaSamaDto: UpdateCollaborationsDto) {
    const collaborations = await this.findOne(collaborationsId);
    if (!collaborations) {
      throw new NotFoundException('partnership not found');
    }
    Object.assign(collaborations, updateKerjaSamaDto);
    return await this.kerjaSamaRepository.save(collaborations);
  }

  async remove(collaborationsId: number) {
    const collaborations = await this.findOne(collaborationsId);
    if (!collaborations) {
      throw new NotFoundException('partnership not found');
    }
    return await this.kerjaSamaRepository.remove(collaborations);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
