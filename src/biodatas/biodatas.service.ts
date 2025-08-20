import { Injectable } from '@nestjs/common';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';

@Injectable()
export class BiodatasService {
  create(createBiodataDto: CreateBiodataDto) {
    return 'This action adds a new biodata';
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
