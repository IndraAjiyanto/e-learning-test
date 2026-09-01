import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BenefitKelas } from 'src/entities/benefit_kelas.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class BenefitKelasService {
  constructor(
    @InjectRepository(BenefitKelas)
    private readonly benefitKelasRepository: Repository<BenefitKelas>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(createBenefitKelaDto: CreateBenefitKelaDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createBenefitKelaDto.kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    const benefit_kelas = await this.benefitKelasRepository.create({
      ...createBenefitKelaDto,
      kelas: kelas,
    });
    return await this.benefitKelasRepository.save(benefit_kelas);
  }

  async findAll() {
    const benefit_kelas = await this.benefitKelasRepository.find({
      relations: ['kelas'],
      order: { createdAt: 'ASC' },
    });
    return benefit_kelas;
  }

  async findAllKelas() {
    const kelas = await this.kelasRepository.find({
      order: { createdAt: 'ASC' },
    });
    return kelas;
  }

  async findKelas(kelasId: string) {
    return await this.kelasRepository.findOne({ where: { id: kelasId } });
  }

  async findOne(benefitKelasId: string) {
    const benefit_kelas = await this.benefitKelasRepository.findOne({
      where: { id: benefitKelasId },
      relations: ['kelas'],
    });
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }
    return benefit_kelas;
  }

  async update(
    benefitKelasId: string,
    updateBenefitKelaDto: UpdateBenefitKelaDto,
  ) {
    const benefit_kelas = await this.findOne(benefitKelasId);
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }

    Object.assign(benefit_kelas, updateBenefitKelaDto);
    return await this.benefitKelasRepository.save(benefit_kelas);
  }

  async remove(benefitKelasId: string) {
    const benefit_kelas = await this.findOne(benefitKelasId);
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }
    return await this.benefitKelasRepository.remove(benefit_kelas);
  }
}
