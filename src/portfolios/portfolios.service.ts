import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/entities/portfolio.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,

    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
  ) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPortfolioDto.userId },
    });
    const kelas = await this.kelasRepository.findOne({
      where: { id: createPortfolioDto.kelasId },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!kelas) {
      throw new NotFoundException('kelas not found');
    }

    const portfolio = await this.portfolioRepository.create({
      ...createPortfolioDto,
      user: user,
      kelas: kelas,
    });

    return await this.portfolioRepository.save(portfolio);
  }

  async findByUser(userId: number) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: ['kelas', 'user', 'kelas.kategori', 'kelas.jenis_kelas'],
    });
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findAll(
    page: number = 1,
    limit: number = 6,
    kategoriId?: number,
    jenisKelasId?: number,
  ) {
    const skip = (page - 1) * limit;

    // Build query with filters
    const queryBuilder = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.kelas', 'kelas')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('kelas.kategori', 'kategori')
      .leftJoinAndSelect('kelas.jenis_kelas', 'jenis_kelas');

    // Apply filters if provided
    if (kategoriId) {
      queryBuilder.andWhere('kategori.id = :kategoriId', { kategoriId });
    }

    if (jenisKelasId) {
      queryBuilder.andWhere('jenis_kelas.id = :jenisKelasId', { jenisKelasId });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const items = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('portfolio.createdAt', 'DESC')
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(portfolioId: number) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['kelas'],
    });
    if (!portfolio) {
      throw new NotFoundException('portfolio not found');
    }
    return portfolio;
  }

  async getPublicIdFromUrl(url: string) {
    // Pisahkan berdasarkan "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    // Ambil bagian setelah upload/
    let path = parts[1];

    // Hapus "v1234567890/" (versi auto Cloudinary)
    path = path.replace(/^v[0-9]+\/?/, '');

    // Buang extension (.jpg, .png, .pdf, dll)
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan

    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        console.log('File not found in Cloudinary.');
      } else {
        console.log('File deleted from Cloudinary:', result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  async update(portfolioId: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.portfolioRepository.update(portfolioId, updatePortfolioDto);
  }

  remove(id: number) {
    return `This action removes a #${id} portfolio`;
  }
}
