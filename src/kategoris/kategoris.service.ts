import { Injectable, NotFoundException } from '@nestjs/common';
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
        'kelas',
        'kelas.jenis_kelas',
        'kelas.user_kelas',
        'kelas.kategori',
        'kelas.alumni',
        'pertanyaan_umum',
        'benefit_category',
        'flow_category',
        'jenis_kelas',
        'superiority',
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
        'kelas',
        'kelas.user_kelas',
        'kelas.alumni',
        'kelas.jenis_kelas',
        'benefit_category',
        'flow_category',
        'pertanyaan_umum',
        'jenis_kelas',
        'superiority',
      ],
    });
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    return kategori;
  }

  async findKelasByKategori(kategoriId: number) {
    return await this.kelasRepository.find({
      where: { kategori: { id: kategoriId } },
      relations: ['kategori', 'jenis_kelas', 'user_kelas', 'user_kelas.user'],
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
      relations: ['kategori'],
    });
  }

  async findBenefitByKategori(kategoriId: number) {
    return await this.benefitCategoryRepository.find({
      where: { kategori: { id: kategoriId } },
      relations: ['kategori'],
    });
  }

  async findFlowByKategori(kategoriId: number) {
    return await this.flowCategoryRepository.find({
      where: { kategori: { id: kategoriId } },
      relations: ['kategori'],
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

  async getPublicIdFromUrl(url: string) {
    // Cek jika url null atau undefined
    if (!url) {
      return null;
    }

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
      } else {
      }
    } catch (error) {
      throw error;
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
