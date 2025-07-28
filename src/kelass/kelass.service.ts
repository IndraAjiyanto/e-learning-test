import { Injectable } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';

@Injectable()
export class KelassService {
  create(createKelassDto: CreateKelassDto) {
    return 'This action adds a new kelass';
  }

  findAll() {
    return `This action returns all kelass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kelass`;
  }

  update(id: number, updateKelassDto: UpdateKelassDto) {
    return `This action updates a #${id} kelass`;
  }

  remove(id: number) {
    return `This action removes a #${id} kelass`;
  }
}
