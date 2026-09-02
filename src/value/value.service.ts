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

  async noValue() {
    const value_old = await this.valueRepository.find({
      order: { valueOrder: 'DESC' },
      take: 1,
    });
    if (!value_old || value_old.length === 0) {
      return 0;
    }
    const value_new = value_old[0].valueOrder + 1;
    return value_new;
  }

  async findAll() {
    return await this.valueRepository.find();
  }

  async findOne(id: string) {
    const value = await this.valueRepository.findOne({ where: { id } });
    if (!value) {
      throw new NotFoundException('Value not found');
    }
    return value;
  }

  async update(id: string, updateValueDto: UpdateValueDto) {
    const value = await this.findOne(id);
    if (!value) {
      throw new NotFoundException('Value not found');
    }
    Object.assign(value, updateValueDto);
    return await this.valueRepository.save(value);
  }

  async remove(id: string) {
    const value = await this.findOne(id);
    await this.valueRepository.remove(value);
    const allValue = await this.valueRepository.find();
    for (const item of allValue) {
      if (item.valueOrder > value.valueOrder) {
        item.valueOrder -= 1;
        await this.valueRepository.save(item);
      }
    }
  }
}
