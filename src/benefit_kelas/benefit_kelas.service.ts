import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBenefitKelaDto } from './dto/create-benefit_kela.dto';
import { UpdateBenefitKelaDto } from './dto/update-benefit_kela.dto';
import cloudinary from 'src/common/config/multer.config';
import { InjectRepository } from '@nestjs/typeorm';
import { BenefitKelas } from 'src/entities/benefit_kelas.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class BenefitKelasService {
  constructor(
    @InjectRepository(BenefitKelas)
    private readonly benefitKelasRepository: Repository<BenefitKelas>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(createBenefitKelaDto: CreateBenefitKelaDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createBenefitKelaDto.kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('kelas not found');
    }
    const benefit_kelas = await this.benefitKelasRepository.create({
      ...createBenefitKelaDto,
      kelas: kelas,
    });
    return await this.benefitKelasRepository.save(benefit_kelas);
  }

  async findAll() {
    const benefit_kelas = await this.benefitKelasRepository.find({
      relations: ['kelas'],
      order: { id: 'ASC' },
    });
    return benefit_kelas;
  }

  async findAllKelas() {
    const kelas = await this.kelasRepository.find({
      order: { id: 'ASC' },
    });
    return kelas;
  }

  async findKelas(kelasId: number) {
    return await this.kelasRepository.findOne({ where: { id: kelasId } });
  }

  async findOne(benefitKelasId: number) {
    const benefit_kelas = await this.benefitKelasRepository.findOne({
      where: { id: benefitKelasId },
      relations: ['kelas'],
    });
    if (!benefit_kelas) {
      throw new NotFoundException('benefit kelas not found');
    }
    return benefit_kelas;
  }

  async update(
    benefitKelasId: number,
    updateBenefitKelaDto: UpdateBenefitKelaDto,
  ) {
    const benefit_kelas = await this.findOne(benefitKelasId);
    if (!benefit_kelas) {
      throw new NotFoundException('benefit kelas not found');
    }

    Object.assign(benefit_kelas, updateBenefitKelaDto);
    return await this.benefitKelasRepository.save(benefit_kelas);
  }

  async remove(benefitKelasId: number) {
    const benefit_kelas = await this.findOne(benefitKelasId);
    if (!benefit_kelas) {
      throw new NotFoundException();
    }
    return await this.benefitKelasRepository.remove(benefit_kelas);
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
}
