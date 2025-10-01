import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(biodataId: number) {
    const biodata = await this.biodataRepository.findOne({where: {id:biodataId}, relations: ['user']})
    if(!biodata){
      throw new NotFoundException('biodata not found')
    }
    return biodata
  }

  async update(biodataId: number, updateBiodataDto: UpdateBiodataDto) {
    const biodata = await this.findOne(biodataId)
    if(!biodata){
      throw new NotFoundException('biodata not found')
    }
            Object.assign(biodata, updateBiodataDto)
        return await this.biodataRepository.save(biodata)
  }

  remove(id: number) {
    return `This action removes a #${id} biodata`;
  }
}
