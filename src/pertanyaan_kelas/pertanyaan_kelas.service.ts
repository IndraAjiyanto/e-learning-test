import { Injectable } from '@nestjs/common';
import { CreatePertanyaanKelaDto } from './dto/create-pertanyaan_kela.dto';
import { UpdatePertanyaanKelaDto } from './dto/update-pertanyaan_kela.dto';

@Injectable()
export class PertanyaanKelasService {
  create(createPertanyaanKelaDto: CreatePertanyaanKelaDto) {
    return 'This action adds a new pertanyaanKela';
  }

  findAll() {
    return `This action returns all pertanyaanKelas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pertanyaanKela`;
  }

  update(id: number, updatePertanyaanKelaDto: UpdatePertanyaanKelaDto) {
    return `This action updates a #${id} pertanyaanKela`;
  }

  remove(id: number) {
    return `This action removes a #${id} pertanyaanKela`;
  }
}
