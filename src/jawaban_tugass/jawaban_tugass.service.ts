import { Injectable } from '@nestjs/common';
import { CreateJawabanTugassDto } from './dto/create-jawaban_tugass.dto';
import { UpdateJawabanTugassDto } from './dto/update-jawaban_tugass.dto';

@Injectable()
export class JawabanTugassService {
  create(createJawabanTugassDto: CreateJawabanTugassDto) {
    return 'This action adds a new jawabanTugass';
  }

  findAll() {
    return `This action returns all jawabanTugass`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jawabanTugass`;
  }

  update(id: number, updateJawabanTugassDto: UpdateJawabanTugassDto) {
    return `This action updates a #${id} jawabanTugass`;
  }

  remove(id: number) {
    return `This action removes a #${id} jawabanTugass`;
  }
}
