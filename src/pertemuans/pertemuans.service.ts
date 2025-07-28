import { Injectable } from '@nestjs/common';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';

@Injectable()
export class PertemuansService {
  create(createPertemuanDto: CreatePertemuanDto) {
    return 'This action adds a new pertemuan';
  }

  findAll() {
    return `This action returns all pertemuans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pertemuan`;
  }

  update(id: number, updatePertemuanDto: UpdatePertemuanDto) {
    return `This action updates a #${id} pertemuan`;
  }

  remove(id: number) {
    return `This action removes a #${id} pertemuan`;
  }
}
