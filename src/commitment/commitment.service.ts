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

  async noCommitment() {
    const commitment_old = await this.commitmentRepository.find({
      order: { commitment_order: 'DESC' },
      take: 1,
    });
    if (!commitment_old || commitment_old.length === 0) {
      return 0;
    }
    const commitment_new = commitment_old[0].commitment_order + 1;
    return commitment_new;
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
      throw new NotFoundException(`Commitment not found`);
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
    const allCommitment = await this.commitmentRepository.find();
    for (const item of allCommitment) {
      if (item.commitment_order > commitment.commitment_order) {
        item.commitment_order -= 1;
        await this.commitmentRepository.save(item);
      }
    }
  }
}
