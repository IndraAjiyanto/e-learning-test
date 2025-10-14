import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisiMisiDto } from './dto/create-visi_misi.dto';
import { UpdateVisiMisiDto } from './dto/update-visi_misi.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VisiMisi } from 'src/entities/visi_misi.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisiMisiService {
    constructor(
      @InjectRepository(VisiMisi)
      private readonly visiMisiRepository: Repository<VisiMisi>
    ) {}

  async create(createVisiMisiDto: CreateVisiMisiDto) {
    const visi_misi = await this.visiMisiRepository.create(createVisiMisiDto);
    return await this.visiMisiRepository.save(visi_misi);
  }

  async findAll() {
    return await this.visiMisiRepository.find();
  }

  async findOne(visi_misiId: number) {
    const visi_misi = await this.visiMisiRepository.findOne({where: {id: visi_misiId}});
    if(!visi_misi){
      throw new NotFoundException('Visi Misi not found');
    }
    return visi_misi;
  }

  async update(visi_misiId: number, updateVisiMisiDto: UpdateVisiMisiDto) {
    const visi_misi = await this.findOne(visi_misiId);
    Object.assign(visi_misi, updateVisiMisiDto);
    return await this.visiMisiRepository.save(visi_misi);
  }

  async remove(visi_misiId: number) {
    const visi_misi = await this.findOne(visi_misiId);
    return await this.visiMisiRepository.remove(visi_misi);
  }
}
