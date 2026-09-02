import { Injectable } from '@nestjs/common';
import { CreateComentDto } from './dto/create-coment.dto';
import { UpdateComentDto } from './dto/update-coment.dto';

@Injectable()
export class ComentService {
  create(createComentDto: CreateComentDto) {
    return 'This action adds a new coment';
  }

  findAll() {
    return `This action returns all coment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coment`;
  }

  update(id: number, updateComentDto: UpdateComentDto) {
    return `This action updates a #${id} coment`;
  }

  remove(id: number) {
    return `This action removes a #${id} coment`;
  }
}
