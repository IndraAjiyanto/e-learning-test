import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import cloudinary from 'src/common/config/multer.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Superiority } from 'src/entities/superiority.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class KategorisService {
  constructor(
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(PertanyaanUmum)
    private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
    @InjectRepository(BenefitCategory)
    private readonly benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(FlowCategory)
    private readonly flowCategoryRepository: Repository<FlowCategory>,
    @InjectRepository(Superiority)
    private readonly superiorityRepository: Repository<Superiority>,
  ) {}

  async create(createKategorisDto: CreateKategorisDto) {
    const { jenis_kelas: jenisKelasIds, ...kategoriData } = createKategorisDto;
    const kategori = await this.kategoriRepository.create(kategoriData);

    if (jenisKelasIds && jenisKelasIds.length > 0) {
      const jenisKelas =
        await this.jenisKelasRepository.findByIds(jenisKelasIds);
      kategori.jenis_kelas = jenisKelas;
    }

    return await this.kategoriRepository.save(kategori);
  }

  async findOneKategori(kategoriName: string) {
    const kategori = await this.kategoriRepository.findOne({
      where: { nama_kategori: kategoriName },
      relations: [
        'jenis_kelas',
      ],
    });
    if(!kategori) {
      throw new NotFoundException('Category not found');
    }
    return kategori;
  }

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findAll() {
    return await this.kategoriRepository.find();
  }

  async findOne(kategoriId: number) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: kategoriId },
      relations: [
        'jenis_kelas'
      ],
    });
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    return kategori;
  }

  async findKelasByKategori(kategoriId: number) {
    return await this.kelasRepository.find({
      where: { kategori: { id: kategoriId }, launch: true },
      relations: ['jenis_kelas','kategori','user_kelas'],
    });
  }


  async findKelasByKategoriAll(kategoriId: number) {
    return await this.kelasRepository.find({
      where: { kategori: { id: kategoriId } },
      relations: ['jenis_kelas','kategori','user_kelas'],
    });
  }

  async findAlumniByKategori(kategoriId: number) {
    return await this.alumniRepository.find({
      where: { kelas: { kategori: { id: kategoriId } } },
      relations: ['kelas'],
    });
  }

  async findFaqByKategori(kategoriId: number) {
    return await this.pertanyaanUmumRepository.find({
      where: { kategori: { id: kategoriId } },
    });
  }

  async findSuperiorityByKategori(kategoriId: number) {
    return await this.superiorityRepository.find({
      where: { kategori: { id: kategoriId } },
    });
  }

  async findBenefitByKategori(kategoriId: number) {
    return await this.benefitCategoryRepository.find({
      where: { kategori: { id: kategoriId } },
    });
  }

  async findFlowByKategori(kategoriId: number) {
    return await this.flowCategoryRepository.find({
      where: { kategori: { id: kategoriId } },
    });
  }

  async update(kategoriId: number, updateKategorisDto: UpdateKategorisDto) {
    const kategori = await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }

    const { jenis_kelas: jenisKelasIds, ...updateData } = updateKategorisDto;
    Object.assign(kategori, updateData);

    if (jenisKelasIds !== undefined) {
      if (jenisKelasIds.length > 0) {
        const jenisKelas =
          await this.jenisKelasRepository.findByIds(jenisKelasIds);
        kategori.jenis_kelas = jenisKelas;
      } else {
        kategori.jenis_kelas = [];
      }
    }

    return await this.kategoriRepository.save(kategori);
  }

  async deleteFile(url: string) {
  if (!url) return;

  try {
    // Convert URL ke full path
    // /uploads/alumni/123.jpg → /project-root/public/uploads/alumni/123.jpg
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Hapus file
    await fs.unlink(filePath);
    console.log('File deleted:', filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found, skipping delete:', url);
    } else {
      console.error('Error deleting file:', error);
      // Tidak throw error agar proses lain tetap jalan
    }
  }
}

  async remove(kategoriId: number) {
    const kategori = await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    await this.kategoriRepository.remove(kategori);
    return { message: 'kategori successfully deleted' };
  }
}
