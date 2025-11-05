import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateValueDto } from './dto/create-value.dto';
import { UpdateValueDto } from './dto/update-value.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Value } from 'src/entities/value.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValueService {
  constructor(
    @InjectRepository(Value)
    private readonly valueRepository: Repository<Value>,
  ) {}

  async create(createValueDto: CreateValueDto) {
    const value = this.valueRepository.create(createValueDto);
    return await this.valueRepository.save(value);
  }

  async findAll() {
    return await this.valueRepository.find();
  }

  async findOne(id: number) {
    const value = await this.valueRepository.findOne({ where: { id } });
    if (!value) {
      throw new NotFoundException('Value not found');
    }
    return value;
  }

  async update(id: number, updateValueDto: UpdateValueDto) {
    const value = await this.findOne(id);
    if (!value) {
      throw new NotFoundException('Value not found');
    }
    Object.assign(value, updateValueDto);
    return await this.valueRepository.save(value);
  }

  async remove(id: number) {
    const value = await this.findOne(id);
    if (!value) {
      throw new NotFoundException('Value not found');
    }
    await this.valueRepository.remove(value);
  }
}
