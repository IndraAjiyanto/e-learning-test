import { Injectable } from '@nestjs/common';
import { CreateJawabanDto } from './dto/create-jawaban.dto';
import { UpdateJawabanDto } from './dto/update-jawaban.dto';

@Injectable()
export class JawabansService {
  create(createJawabanDto: CreateJawabanDto) {
    return 'This action adds a new jawaban';
  }

  findAll() {
    return `This action returns all jawabans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jawaban`;
  }

  update(id: number, updateJawabanDto: UpdateJawabanDto) {
    return `This action updates a #${id} jawaban`;
  }

  remove(id: number) {
    return `This action removes a #${id} jawaban`;
  }
}
