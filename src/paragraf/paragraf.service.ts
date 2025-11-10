import { Injectable } from '@nestjs/common';
import { CreateParagrafDto } from './dto/create-paragraf.dto';
import { UpdateParagrafDto } from './dto/update-paragraf.dto';

@Injectable()
export class ParagrafService {
  create(createParagrafDto: CreateParagrafDto) {
    return 'This action adds a new paragraf';
  }

  findAll() {
    return `This action returns all paragraf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paragraf`;
  }

  update(id: number, updateParagrafDto: UpdateParagrafDto) {
    return `This action updates a #${id} paragraf`;
  }

  remove(id: number) {
    return `This action removes a #${id} paragraf`;
  }
}
