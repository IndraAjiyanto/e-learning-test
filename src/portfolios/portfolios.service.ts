import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/entities/portfolio.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import * as ps from 'fs/promises';
import * as path from 'path';
import * as fs from 'fs';

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

  async findByUser(userId: string) {
    return await this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: [
        'kelas',
        'kelas.kategori',
        'kelas.jenis_kelas',
        'kelas.teknologi',
      ],
    });
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findKategoriMyPortfolio(userId: string) {
    return await this.kategoriRepository.find({where: { kelas: { user_kelas: { user: { id: userId } } } } });
  }

  async findJenisKelasMyPortfolio(userId: string) {
    return await this.jenisKelasRepository.find({where: { kelas: { user_kelas: { user: { id: userId } } } } });
  }

  async findAll(
    page: number = 1,
    limit: number = 6,
    kategoriId?: string,
    jenisKelasId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.kelas', 'kelas')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('kelas.kategori', 'kategori')
      .leftJoinAndSelect('kelas.jenis_kelas', 'jenis_kelas');

    if (kategoriId) {
      queryBuilder.andWhere('kategori.id = :kategoriId', { kategoriId });
    }

    if (jenisKelasId) {
      queryBuilder.andWhere('jenis_kelas.id = :jenisKelasId', { jenisKelasId });
    }

    const total = await queryBuilder.getCount();

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

  async findOne(portfolioId: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['kelas', 'kelas.teknologi'],
    });
    if (!portfolio) {
      throw new NotFoundException('portfolio not found');
    }
    return portfolio;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await ps.unlink(filePath);
    } catch (error) {}
  }

  async ChangeImageEditorJS(
    isi: string,
    oldFolder: string,
    newFolder: string,
    deleteFileInFolder?: string,
  ): Promise<string> {
    const editorjsData = JSON.parse(isi);

    const tempDir = path.join(process.cwd(), 'public' + oldFolder);
    const finalDir = path.join(process.cwd(), 'public' + newFolder);

    editorjsData.blocks.forEach((block: any) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const oldUrl = block.data.file.url;

        const fileName = oldUrl.split('/').pop();

        const oldPath = path.join(tempDir, fileName);
        const newPath = path.join(finalDir, fileName);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }

        block.data.file.url = `${newFolder}/${fileName}`;
      }
    });

    if (deleteFileInFolder) {
      const deleteDir = path.join(process.cwd(), 'public' + deleteFileInFolder);

      if (fs.existsSync(deleteDir)) {
        const files = fs.readdirSync(deleteDir);

        files.forEach((file) => {
          const filePath = path.join(deleteDir, file);

          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    return JSON.stringify(editorjsData);
  }

  async update(portfolioId: string, updatePortfolioDto: UpdatePortfolioDto) {
    await this.portfolioRepository.update(portfolioId, updatePortfolioDto);
  }

  async deleteUnusedImages(oldImage: string[], newImage: string[]) {
    const publicDir = path.join(process.cwd(), 'public');

    const fileToDelete = oldImage.filter(
      (oldPath) => !newImage.includes(oldPath),
    );

    await Promise.all(
      fileToDelete.map(async (dbPath) => {
        try {
          const fullPath = path.join(publicDir, dbPath);
          await ps.unlink(fullPath);
        } catch (err) {}
      }),
    );

    return newImage;
  }

  async remove(portfolioId: string) {
    const portfolio = await this.findOne(portfolioId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio Not Found');
    }
    return await this.portfolioRepository.remove(portfolio);
  }
}
