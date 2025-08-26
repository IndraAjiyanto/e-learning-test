import { Injectable } from '@nestjs/common';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';

@Injectable()
export class PertanyaansService {
  create(createPertanyaanDto: CreatePertanyaanDto) {
    return 'This action adds a new pertanyaan';
  }

  findAll() {
    return `This action returns all pertanyaans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pertanyaan`;
  }

  update(id: number, updatePertanyaanDto: UpdatePertanyaanDto) {
    return `This action updates a #${id} pertanyaan`;
  }

  remove(id: number) {
    return `This action removes a #${id} pertanyaan`;
  }
}
