import { Injectable } from '@nestjs/common';
import { CreateIntenshifDto } from './dto/create-intenshif.dto';
import { UpdateIntenshifDto } from './dto/update-intenshif.dto';

@Injectable()
export class IntenshifService {
  create(createIntenshifDto: CreateIntenshifDto) {
    return 'This action adds a new intenshif';
  }

  findAll() {
    return `This action returns all intenshif`;
  }

  findOne(id: number) {
    return `This action returns a #${id} intenshif`;
  }

  update(id: number, updateIntenshifDto: UpdateIntenshifDto) {
    return `This action updates a #${id} intenshif`;
  }

  remove(id: number) {
    return `This action removes a #${id} intenshif`;
  }
}
