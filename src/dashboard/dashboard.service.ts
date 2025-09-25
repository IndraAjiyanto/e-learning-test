import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Alumni } from 'src/entities/alumni.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Kelas)
        private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(PertanyaanUmum)
        private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
    @InjectRepository(Alumni)
        private readonly alumniRepository: Repository<Alumni>
  ) {}

  async findAllKelas(){
    return await this.kelasRepository.find({where: {launch: true}, order: {id: 'DESC'}, relations: ['kategori']});
  }

  async findFAQ(){
    return await this.pertanyaanUmumRepository.find()
  }

  async findAlumni(){
    return await this.alumniRepository.find({relations: ['kelas']})
  }
  
  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
