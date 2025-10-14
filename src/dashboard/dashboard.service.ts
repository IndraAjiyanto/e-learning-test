import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portfolio } from 'src/entities/portfolio.entity';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Kelas)
        private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(PertanyaanUmum)
        private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
    @InjectRepository(Alumni)
        private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Portfolio)
        private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(GambarBenefit)
        private readonly gambarBenefitRepository: Repository<GambarBenefit>,
    @InjectRepository(Kategori)
        private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(JenisKelas)
        private readonly jenisKelasRepository: Repository<JenisKelas>,
  ) {}

  async findAllKelas(){
    return await this.kelasRepository.find({where: {launch: true}, order: {id: 'DESC'}, relations: ['kategori', 'jenis_kelas', 'user_kelas']});
  }

  async findKelasByKategori(kategoriName: string){
    return await this.kelasRepository.find({where: {kategori: {nama_kategori: kategoriName}, launch: true}, order: {id: 'DESC'}, relations: ['kategori', 'jenis_kelas']})
  }

  async findPortfolio(){
    return await this.portfolioRepository.find({relations: ['kelas','kelas.kategori','kelas.jenis_kelas', 'user', 'user.biodata']})
  }

  async findOnePortfolio(portfolioId: number){
    return await this.portfolioRepository.findOne({where: {id: portfolioId}, relations: ['kelas','kelas.kategori','kelas.jenis_kelas', 'user', 'user.biodata']})
  }

  async paginatePortfolio({ kategori, jenis_kelas, page, limit }) {
  const queryBuilder = this.portfolioRepository.createQueryBuilder('portfolio')
    .leftJoinAndSelect('portfolio.kelas', 'kelas')
    .leftJoinAndSelect('portfolio.user', 'user')
    .leftJoinAndSelect('kelas.jenis_kelas', 'jenis_kelas')
    .leftJoinAndSelect('kelas.kategori', 'kategori');

  if (kategori) queryBuilder.andWhere('kelas.kategoriId = :kategori', { kategori });
  if (jenis_kelas) queryBuilder.andWhere('kelas.jenis_kelasId = :jenis_kelas', { jenis_kelas });

  queryBuilder.orderBy('portfolio.id', 'DESC');

  return paginate(queryBuilder, { page, limit });
}

  async findFAQ(){
    return await this.pertanyaanUmumRepository.find()
  }

  async findAlumni(){
    return await this.alumniRepository.find()
  }

    async findKategori(){
    return await this.kategoriRepository.find()
  }

  async findJenisKelas(){
    return await this.jenisKelasRepository.find()
  }

  async findGambar(){
    return await this.gambarBenefitRepository.find()
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
