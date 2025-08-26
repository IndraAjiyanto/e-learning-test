import { Injectable } from '@nestjs/common';
import { CreateTugassDto } from './dto/create-tugass.dto';
import { UpdateTugassDto } from './dto/update-tugass.dto';

@Injectable()
export class TugassService {
  create(createTugassDto: CreateTugassDto) {
    return 'This action adds a new tugass';
  }

  findAll() {
    return `This action returns all tugass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tugass`;
  }

  update(id: number, updateTugassDto: UpdateTugassDto) {
    return `This action updates a #${id} tugass`;
  }

  remove(id: number) {
    return `This action removes a #${id} tugass`;
  }
}
