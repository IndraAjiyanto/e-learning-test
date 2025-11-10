import { Injectable } from '@nestjs/common';
import { CreateBulanDto } from './dto/create-bulan.dto';
import { UpdateBulanDto } from './dto/update-bulan.dto';

@Injectable()
export class BulanService {
  create(createBulanDto: CreateBulanDto) {
    return 'This action adds a new bulan';
  }

  findAll() {
    return `This action returns all bulan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bulan`;
  }

  update(id: number, updateBulanDto: UpdateBulanDto) {
    return `This action updates a #${id} bulan`;
  }

  remove(id: number) {
    return `This action removes a #${id} bulan`;
  }
}
