import { Injectable } from '@nestjs/common';
import { CreateKategoriBlogDto } from './dto/create-kategori_blog.dto';
import { UpdateKategoriBlogDto } from './dto/update-kategori_blog.dto';

@Injectable()
export class KategoriBlogService {
  create(createKategoriBlogDto: CreateKategoriBlogDto) {
    return 'This action adds a new kategoriBlog';
  }

  findAll() {
    return `This action returns all kategoriBlog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kategoriBlog`;
  }

  update(id: number, updateKategoriBlogDto: UpdateKategoriBlogDto) {
    return `This action updates a #${id} kategoriBlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} kategoriBlog`;
  }
}
