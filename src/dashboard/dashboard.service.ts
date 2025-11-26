import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { In, Repository } from 'typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portfolio } from 'src/entities/portfolio.entity';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { Team } from 'src/entities/team.entity';
import { Social } from 'src/entities/social.entity';
import { Blog } from 'src/entities/blog.entity';
import { Tentang } from 'src/entities/tentang.entity';
import { Value } from 'src/entities/value.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Visi } from 'src/entities/visi.entity';
import { Commitment } from 'src/entities/commitment.entity';
import { Misi } from 'src/entities/misi.entity';
import { Experience } from 'src/entities/experience.entity';
import { Award } from 'src/entities/award.entity';
import { Background } from 'src/entities/background.entity';
import { Paragraf } from 'src/entities/paragraf.entity';
import { Faq } from 'src/entities/faq.entity';

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
    @InjectRepository(Visi)
    private readonly visiRepository: Repository<Visi>,
    @InjectRepository(Commitment)
    private readonly commitmentRepository: Repository<Commitment>,
    @InjectRepository(Misi)
    private readonly misiRepository: Repository<Misi>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(Award)
    private readonly awardRepository: Repository<Award>,
    @InjectRepository(Background)
    private readonly backgroundRepository: Repository<Background>,
    @InjectRepository(Paragraf)
    private readonly paragrafRepository: Repository<Paragraf>,
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async findAllKelas() {
    return await this.kelasRepository.find({
      where: { launch: true },
      order: { id: 'DESC' },
      relations: ['kategori', 'jenis_kelas', 'user_kelas','mentor'],
    });
  }

  async findVisiMisi() {
    return await this.visiRepository.find();
  }

  async findCommitment() {
    return await this.commitmentRepository.find({
      order: { commitment_ke: 'ASC' },
    });
  }

  async findValue() {
    return await this.valueRepository.find({ order: { value_ke: 'ASC' } });
  }

  async findKelasByMentoring(userId: number) {
    return await this.kelasRepository.find({
      where: { mentoring: { user: { id: userId } } },
      relations: [
        'user_kelas',
        'user_kelas.user',
        'kategori',
        'jenis_kelas',
        'mentoring',
        'mentoring.user',
        'mentor'
      ],
    });
  }

  async findTeamLead() {
    return await this.teamLeadRepository.find();
  }

  async findMisi() {
    return await this.misiRepository.find({ order: { misi_ke: 'ASC' } });
  }

  async findExperience() {
    return await this.experienceRepository.find({
      order: { experience_ke: 'ASC' },
    });
  }

  async findAward() {
    return await this.awardRepository.find({ order: { award_ke: 'ASC' } });
  }

  async findTentang() {
    return await this.tentangRepository.find();
  }

  async findTentangParagraf() {
    return await this.paragrafRepository.find({ order: { p_ke: 'ASC' } });
  }

  async findBackground() {
    return await this.backgroundRepository.find({
      order: { background_ke: 'ASC' },
    });
  }

  async findKelas() {
    return await this.kelasRepository.find({
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
        'kelas.bulan',
        'kelas.teknologi',
        'kelas.jenis_kelas',
        'user',
        'user.biodata',
      ],
    });
  }

  async findFAQ() {
    return await this.faqRepository.find();
  }

  async findAlumni() {
    return await this.alumniRepository.find({
      relations: ['kelas'],
      order: { id: 'DESC' },
    });
  }

  async findKerjaSama() {
    return await this.kerjaSamaRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findTeam() {
    return await this.teamRepository.find({
      order: { team_ke: 'ASC' },
    });
  }

  async findSocial() {
    return await this.socialRepository.find();
  }

  async findSpecialProgram(){
    return await this.kategoriRepository.find({where: {type: 'Special Program'}})
  }

  async findOneKategori(kategoriName: string){
    return await this.kategoriRepository.findOne({where: {nama_kategori: kategoriName}, relations: ['kelas','alumni','pertanyaan_umum']})
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }

  async findBenefit1() {
    return await this.benefitRepository.findOne({ where: { no: 1 } });
  }

  async findBenefit2() {
    return await this.benefitRepository.findOne({ where: { no: 2 } });
  }

  async findBenefit3() {
    return await this.benefitRepository.findOne({ where: { no: 3 } });
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
}
