import { Injectable } from '@nestjs/common';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';

@Injectable()
export class PembayaransService {
  create(createPembayaranDto: CreatePembayaranDto) {
    return 'This action adds a new pembayaran';
  }

  findAll() {
    return `This action returns all pembayarans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pembayaran`;
  }

  update(id: number, updatePembayaranDto: UpdatePembayaranDto) {
    return `This action updates a #${id} pembayaran`;
  }

  remove(id: number) {
    return `This action removes a #${id} pembayaran`;
  }
}
