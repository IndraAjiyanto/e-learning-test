import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { UpdateCommitmentDto } from './dto/update-commitment.dto';
import { Commitment } from '../entities/commitment.entity';

@Injectable()
export class CommitmentService {
  constructor(
    @InjectRepository(Commitment)
    private readonly commitmentRepository: Repository<Commitment>,
  ) {}

  async create(createCommitmentDto: CreateCommitmentDto): Promise<Commitment> {
    const commitment = this.commitmentRepository.create(createCommitmentDto);
    return await this.commitmentRepository.save(commitment);
  }

  async findAll(): Promise<Commitment[]> {
    return await this.commitmentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Commitment> {
    const commitment = await this.commitmentRepository.findOne({
      where: { id },
    });
    if (!commitment) {
      throw new NotFoundException(`Commitment with ID ${id} not found`);
    }
    return commitment;
  }

  async update(
    id: number,
    updateCommitmentDto: UpdateCommitmentDto,
  ): Promise<Commitment> {
    const commitment = await this.findOne(id);
    Object.assign(commitment, updateCommitmentDto);
    return await this.commitmentRepository.save(commitment);
  }

  async remove(id: number): Promise<void> {
    const commitment = await this.findOne(id);
    await this.commitmentRepository.remove(commitment);
  }
}
