import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCicilanDto } from './dto/create-cicilan.dto';
import { UpdateCicilanDto } from './dto/update-cicilan.dto';
import { Cicilan } from '../entities/cicilan.entity';
import { Kelas } from '../entities/kelas.entity';

@Injectable()
export class CicilanService {
  constructor(
    @InjectRepository(Cicilan)
    private cicilanRepository: Repository<Cicilan>,
    @InjectRepository(Kelas)
    private kelasRepository: Repository<Kelas>,
  ) {}

  async create(createCicilanDto: CreateCicilanDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createCicilanDto.kelasId },
    });

    if (!kelas) {
      throw new NotFoundException(`Program not found`);
    }

    const cicilan = this.cicilanRepository.create({
      ...createCicilanDto,
      kelas,
    });

    return await this.cicilanRepository.save(cicilan);
  }

  async findAll() {
    return await this.cicilanRepository.find({
      relations: ['kelas'],
      order: { bulan: 'ASC' },
    });
  }

  async findOne(id: number) {
    const cicilan = await this.cicilanRepository.findOne({
      where: { id },
      relations: ['kelas'],
    });

    if (!cicilan) {
      throw new NotFoundException(`Installment not found`);
    }

    return cicilan;
  }

  async findByKelas(kelasId: number) {
    return await this.cicilanRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['kelas'],
      order: { bulan: 'ASC' },
    });
  }

    async findNo(kelasId: number) {
        const installment = await this.findByKelas(kelasId);
      const usedNumbers = installment.map((i) => Number(i.bulan));
      
      const availableNumbers = [3, 6, 12].filter(
        (n) => !usedNumbers.includes(n)
      );
      return availableNumbers;
  }

  async update(id: number, updateCicilanDto: UpdateCicilanDto) {
    const cicilan = await this.findOne(id);

    if (updateCicilanDto.kelasId) {
      const kelas = await this.kelasRepository.findOne({
        where: { id: updateCicilanDto.kelasId },
      });

      if (!kelas) {
        throw new NotFoundException(`Program not found`);
      }

      cicilan.kelas = kelas;
    }

    if (updateCicilanDto.harga) {
      cicilan.harga = updateCicilanDto.harga;
    }

    if (updateCicilanDto.bulan) {
      cicilan.bulan = updateCicilanDto.bulan;
    }

    if (updateCicilanDto.dp) {
      cicilan.dp = updateCicilanDto.dp;
    }

    return await this.cicilanRepository.save(cicilan);
  }

  async remove(id: number) {
    const cicilan = await this.findOne(id);
    return await this.cicilanRepository.remove(cicilan);
  }
}
