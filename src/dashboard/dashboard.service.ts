import { ILike, Like, Raw, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portfolio } from 'src/entities/portfolio.entity';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Partner } from 'src/entities/partner.entity';
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
import { OurExperience } from 'src/entities/our_experience.entity';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
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
    @InjectRepository(Partner)
    private readonly PartnerRepository: Repository<Partner>,
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
    @InjectRepository(OurExperience)
    private readonly ourExperienceRepository: Repository<OurExperience>,
    @InjectRepository(KategoriBlog)
    private readonly kategoriBlogRepository: Repository<KategoriBlog>,
  ) {}

async findBlogTrending(userId?: number) {
  const qb = this.blogRepository
    .createQueryBuilder('blog')
    .loadRelationCountAndMap('blog.likesCount', 'blog.likes')
    .addSelect(
      'blog.views + (SELECT COUNT(*) FROM likes l WHERE l."blogId" = blog.id)',
      'score'
    )
    .where('blog.createdAt >= NOW() - INTERVAL \'1 month\'')
    .orderBy('score', 'DESC');

  if (userId) {
    qb.addSelect(
      `CAST(EXISTS(
        SELECT 1 FROM likes l
        WHERE l."blogId" = blog.id AND l."userId" = :userId
      ) AS boolean)`,
      'isLiked'
    ).setParameter('userId', userId);
  }

  const { entities, raw } = await qb.getRawAndEntities();
  const blog = entities[0];
  if (!blog) return null;

  return {
    ...blog,
    isLiked: userId ? (raw[0]?.isLiked === true) : false,
  };
}

async findAllKategori() {
  return await this.kategoriRepository.find({ order: { id: 'ASC' } });
}


async findKategoriTrending(userId?: number) {
  const kategoriTrending = await this.kategoriBlogRepository
    .createQueryBuilder('kategori')
    .leftJoin('kategori.blog', 'blog')
    .addSelect(
      `SUM(
        (blog.views * 1) + 
        ((SELECT COUNT(*) FROM likes l WHERE l."blogId" = blog.id) * 2)
      )`,
      'score'
    )
    .groupBy('kategori.id')
    .orderBy('score', 'DESC')
    .take(2)
    .getRawMany();

  const result = await Promise.all(
    kategoriTrending.map(async (kategori) => {
      const qb = this.blogRepository
        .createQueryBuilder('blog')
        .leftJoinAndSelect('blog.kategori_blog', 'kategori_blog')
        .loadRelationCountAndMap('blog.likesCount', 'blog.likes')
        .where('kategori_blog.id = :id', { id: kategori.kategori_id })
        .orderBy(
          '(blog.views + (SELECT COUNT(*) FROM likes l WHERE l."blogId" = blog.id))',
          'DESC'
        );

      if (userId) {
        qb.addSelect(
          `CAST(EXISTS(
            SELECT 1 FROM likes l
            WHERE l."blogId" = blog.id AND l."userId" = :userId
          ) AS boolean)`,
          'isLiked'
        ).setParameter('userId', userId);
      }

      const { entities, raw } = await qb.getRawAndEntities();
      const topBlog = entities[0];

      return {
        id: kategori.kategori_id,
        nama: kategori.kategori_nama,
        icon: kategori.kategori_icon,
        deskripsi: kategori.kategori_deskripsi,
        createdAt: kategori.kategori_createdAt,
        updatedAt: kategori.kategori_updatedAt,
        score: kategori.score,
        blog: topBlog
          ? { ...topBlog, isLiked: userId ? (raw[0]?.isLiked === true) : false }
          : null,
      };
    })
  );

  return result;
}

  async findBlogCategory() {
    return await this.kategoriBlogRepository.find({
      order: { nama: 'ASC' },
    });
  }

  async findOurExperience() {
    return await this.ourExperienceRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findAllKelas() {
    return await this.kelasRepository.find({
      where: { launch: true },
      order: { id: 'DESC' },
      relations: [
        'kategori',
        'jenis_kelas',
        'user_kelas',
        'mentoring',
        'mentoring.user',
      ],
    });
  }

  async findKelasPaginated(params: {
    userId?: number;
  kategori?: string;
  jenisKelas?: string;
  metode?: string;
  search?: string;
  page: number;
  limit: number;
}) {
  const query = this.kelasRepository.createQueryBuilder('kelas')
    .leftJoinAndSelect('kelas.kategori', 'kategori')
    .leftJoinAndSelect('kelas.jenis_kelas', 'jenis_kelas')
    .leftJoinAndSelect('kelas.user_kelas', 'user_kelas')
    .where('kelas.launch = :launch', { launch: true });

    if(params.userId){
      query.andWhere('user_kelas.user.id = :userId', { userId: params.userId });
    }

  if (params.kategori) {
    query.andWhere('kategori.nama_kategori = :kategori', { kategori: params.kategori });
  }
  if (params.jenisKelas) {
    query.andWhere('jenis_kelas.nama_jenis_kelas = :jenisKelas', { jenisKelas: params.jenisKelas });
  }
  if (params.metode) {
    query.andWhere('kelas.metode = :metode', { metode: params.metode });
  }
  if (params.search) {
    query.andWhere('kelas.nama_kelas ILIKE :search', { search: `%${params.search}%` });
  }

  query.orderBy('kelas.id', 'DESC')
    .skip((params.page - 1) * params.limit)
    .take(params.limit);

  const [data, total] = await query.getManyAndCount();
  return { data, total };
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
        'kategori',
        'jenis_kelas',
        'mentoring',
        'mentoring.user',
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
    return await this.tentangRepository.find({});
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

async findBlog(excludeIds: number[] = []) {
  const qb = this.blogRepository
    .createQueryBuilder('blog')
    .leftJoinAndSelect('blog.kategori_blog', 'kategori_blog')
    .leftJoinAndSelect('blog.likes', 'likes')
    .leftJoinAndSelect('likes.user', 'user')
    .orderBy(
      '(blog.views * 1) + ((SELECT COUNT(*) FROM likes l WHERE l."blogId" = blog.id) * 2)',
      'DESC'
    )
    .addOrderBy('blog.createdAt', 'DESC');

  if (excludeIds.length > 0) {
    qb.where('blog.id NOT IN (:...excludeIds)', { excludeIds });
  }

  return await qb.getMany();
}

async findPortfolio(options?: {
  userId?: number | null;
  kategoriId?: string | null;
  jenisKelasId?: string | null;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 6;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options?.userId) {
    where.user = { id: options.userId };
  }

  if (options?.kategoriId) {
    where.kelas = {
      ...where.kelas,
      kategori: { id: options.kategoriId }
    };
  }

  if (options?.jenisKelasId) {
    where.kelas = {
      ...where.kelas,
      jenis_kelas: { id: options.jenisKelasId }
    };
  }

  const [data, total] = await this.portfolioRepository.findAndCount({
    where,
    relations: ['kelas', 'kelas.kategori', 'kelas.jenis_kelas', 'user'],
    skip,
    take: limit,
  });

  return { data, total };
}


async findAlumni(options?: {
  kelasId?: string | null;
  search?: string | null;
  kategoriId?: string | null; 
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 6;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Logika filter kelas atau kategori global
  if (options?.kelasId) {
    where.kelas = { id: options.kelasId };
  } else if (options?.kategoriId) {
    where.kelas = { kategori: { id: options.kategoriId } };
  }
 if (options?.search && options.search.trim() !== '') {
    const keyword = `%${options.search.trim()}%`;
    where.nama = ILike(keyword);
  }

  const [data, total] = await this.alumniRepository.findAndCount({
    where,
    relations: ['kelas', 'kelas.kategori'],
    order: { createdAt: 'DESC' },
    skip,
    take: limit,
  });

  return { data, total };
}

  async findAllAlumni() {
    return await this.alumniRepository.find({
      relations: ['kelas'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  // async findPortfolio() {
  //   return await this.portfolioRepository.find({
  //     relations: ['kelas', 'kelas.kategori', 'kelas.jenis_kelas', 'user'],
  //   });
  // }

  async findOnePortfolio(portfolioId: number) {
    return await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['kelas', 'kelas.kategori', 'kelas.teknologi', 'user'],
    });
  }

  async findFAQ() {
    return await this.faqRepository.find();
  }

  // async findAlumni() {
  //   return await this.alumniRepository.find({
  //     relations: ['kelas'],
  //     order: { createdAt: 'DESC' },
  //     take: 6,
  //   });
  // }

  async findKerjaSama() {
    return await this.PartnerRepository.find({
      relations: ['categoryPartner'],
      order: { createdAt: 'ASC' },
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

  async findSpecialProgram() {
    return await this.kategoriRepository.find({
      where: { type: 'Special Program' },
    });
  }

  async findOneKategori(kategoriName: string) {
    return await this.kategoriRepository.findOne({
      where: { nama_kategori: kategoriName },
      relations: ['kelas', 'alumni', 'pertanyaan_umum'],
    });
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
