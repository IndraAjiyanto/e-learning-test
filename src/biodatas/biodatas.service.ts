import { Injectable } from '@nestjs/common';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Biodata } from 'src/entities/biodata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BiodatasService {
    constructor(
      @InjectRepository(Biodata)
      private readonly biodataRepository: Repository<Biodata>
    ) {}
  async create(createBiodataDto: CreateBiodataDto) {
    const biodata = await this.biodataRepository.create(createBiodataDto)
    return await this.biodataRepository.save(biodata)
  }

  findAll() {
    return `This action returns all biodatas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} biodata`;
  }

  update(id: number, updateBiodataDto: UpdateBiodataDto) {
    return `This action updates a #${id} biodata`;
  }

  remove(id: number) {
    return `This action removes a #${id} biodata`;
  }
}
