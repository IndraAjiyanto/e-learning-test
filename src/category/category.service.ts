import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { BenefitCategory } from 'src/entities/benefit_category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(BenefitCategory)
    private readonly benefitCategoryRepository: Repository<BenefitCategory>,
    @InjectRepository(PertanyaanUmum)
    private readonly pertanyaanUmumRepository: Repository<PertanyaanUmum>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  async findOne(categoryId: number) {
    const category = await this.kategoriRepository.findOne({
      where: { id: categoryId },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });
    if(!category){
      throw new NotFoundException('category not found')
    }
    return category;
  }

  async findAll(categoryId: number) {
    const kelas = await this.kelasRepository.find({
      where: { kategori: { id: categoryId } },
      relations: ['kategori', 'jenis_kelas', 'user_kelas'],
    });

    // Add percentage calculation for progress bar
    return kelas.map((k) => ({
      ...k,
      quotaPercentage:
        k.kuota > 0 ? Math.round((k.user_kelas.length / k.kuota) * 100) : 0,
    }));
  }

  async findBenefit(categoryId: number) {
    return await this.benefitCategoryRepository.find({
      where: { kategori: { id: categoryId } },
    });
  }
  

  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findAlumni(categoryId: number) {
    return await this.alumniRepository.find({
      where: { kelas: { kategori: { id: categoryId } } },
      relations: ['kelas'],
    });
  }

  async findFaq(categoryId: number) {
    return await this.pertanyaanUmumRepository.find({
      where: { kategori: { id: categoryId } },
    });
  }
}
