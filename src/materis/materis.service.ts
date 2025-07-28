import { Injectable } from '@nestjs/common';
import { CreateMaterisDto } from './dto/create-materis.dto';
import { UpdateMaterisDto } from './dto/update-materis.dto';

@Injectable()
export class MaterisService {
  create(createMaterisDto: CreateMaterisDto) {
    return 'This action adds a new materis';
  }

  findAll() {
    return `This action returns all materis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} materis`;
  }

  update(id: number, updateMaterisDto: UpdateMaterisDto) {
    return `This action updates a #${id} materis`;
  }

  remove(id: number) {
    return `This action removes a #${id} materis`;
  }
}
