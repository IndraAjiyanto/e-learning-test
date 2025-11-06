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
import { paginateQuery } from 'src/common/utils/pagination.helper';
import { PaginationParams } from 'src/common/decorators/pagination.decorator';
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { Team } from 'src/entities/team.entity';
import { Social } from 'src/entities/social.entity';
import { Blog } from 'src/entities/blog.entity';
import { Tentang } from 'src/entities/tentang.entity';
import { Value } from 'src/entities/value.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { VisiMisi } from 'src/entities/visi_misi.entity';
import { Commitment } from 'src/entities/commitment.entity';

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
    @InjectRepository(KerjaSama)
    private readonly kerjaSamaRepository: Repository<KerjaSama>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Tentang)
    private readonly tentangRepository: Repository<Tentang>,
    @InjectRepository(Value)
    private readonly valueRepository: Repository<Value>,
    @InjectRepository(TeamLead)
    private readonly teamLeadRepository: Repository<TeamLead>,
    @InjectRepository(VisiMisi)
    private readonly visiMisiRepository: Repository<VisiMisi>,
    @InjectRepository(Commitment)
    private readonly commitmentRepository: Repository<Commitment>,
  ) {}

  async findAllKelas() {
    return await this.kelasRepository.find({
      where: { launch: true },
      order: { id: 'DESC' },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });
  }

  async findTentang() {
    return await this.tentangRepository.find();
  }

  async findKelas() {
    return await this.kelasRepository.find({
      order: { id: 'DESC' },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });
  }

  async findKelasByKategori(kategoriName: string) {
    return await this.kelasRepository.find({
      where: { kategori: { nama_kategori: kategoriName }, launch: true },
      order: { id: 'DESC' },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });
  }

  async findBlog() {
    return await this.blogRepository.find({
      order: { id: 'DESC' },
      relations: ['kategori_blog', 'user', 'user.biodata'],
    });
  }

  async findPortfolio() {
    return await this.portfolioRepository.find({
      relations: [
        'kelas',
        'kelas.kategori',
        'kelas.jenis_kelas',
        'user',
        'user.biodata',
      ],
    });
  }

  async findOnePortfolio(portfolioId: number) {
    return await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: [
        'kelas',
        'kelas.kategori',
        'kelas.jenis_kelas',
        'user',
        'user.biodata',
      ],
    });
  }

  async findFAQ() {
    return await this.pertanyaanUmumRepository.find();
  }

  async findAlumni() {
    return await this.alumniRepository.find({
      relations: ['kelas'],
      order: { id: 'DESC' },
    });
  }

  async findKerjaSama() {
    return await this.kerjaSamaRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findTeam() {
    return await this.teamRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findSocial(){
    return await this.socialRepository.find();
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }

  async findBenefit1(){
    return await this.benefitRepository.findOne({where: {no: 1}});
  }

  async findBenefit2(){
    return await this.benefitRepository.findOne({where: {no: 2}});
  }

  async findBenefit3(){
    return await this.benefitRepository.findOne({where: {no: 3}});
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findGambar1() {
    return await this.gambarBenefitRepository.findOne({ where: { no: 1 } });
  }

  async findGambar2() {
    return await this.gambarBenefitRepository.findOne({ where: { no: 2 } });
  }

  async findGambar3() {
    return await this.gambarBenefitRepository.findOne({ where: { no: 3 } });
  }

  async findGambar4() {
    return await this.gambarBenefitRepository.findOne({ where: { no: 4 } });
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
