import { Injectable } from '@nestjs/common';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';

@Injectable()
export class KategorisService {
  create(createKategorisDto: CreateKategorisDto) {
    return 'This action adds a new kategoris';
  }

  findAll() {
    return `This action returns all kategoris`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kategoris`;
  }

  update(id: number, updateKategorisDto: UpdateKategorisDto) {
    return `This action updates a #${id} kategoris`;
  }

  remove(id: number) {
    return `This action removes a #${id} kategoris`;
  }
}
