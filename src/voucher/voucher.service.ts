import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from 'src/entities/voucher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const voucher = this.voucherRepository.create(createVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async findAll() {
    return await this.voucherRepository.find();
  }

  async findOne(id: number) {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async update(id: number, updateVoucherDto: UpdateVoucherDto) {
    const voucher = await this.findOne(id);
    Object.assign(voucher, updateVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async remove(id: number) {
    const voucher = await this.findOne(id);
    return await this.voucherRepository.remove(voucher);
  }
}
