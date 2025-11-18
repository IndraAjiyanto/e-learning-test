import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGambarBenefitDto } from './dto/create-gambar_benefit.dto';
import { UpdateGambarBenefitDto } from './dto/update-gambar_benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GambarBenefit } from 'src/entities/gambar_benefit.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class GambarBenefitService {
  constructor(
    @InjectRepository(GambarBenefit)
    private readonly gambarBenefitRepository: Repository<GambarBenefit>,
  ) {}

  async create(createGambarBenefitDto: CreateGambarBenefitDto) {
    const gambar_benefit = await this.gambarBenefitRepository.create(
      createGambarBenefitDto,
    );
    return await this.gambarBenefitRepository.save(gambar_benefit);
  }

  async findAll() {
    return await this.gambarBenefitRepository.find({
      order: { no: 'ASC' },
    });
  }

  async findOne(gambarBenefitId: number) {
    const gambar_benefit = await this.gambarBenefitRepository.findOne({
      where: { id: gambarBenefitId },
    });
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    return gambar_benefit;
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

  async update(
    gambarBenefitId: number,
    updateGambarBenefitDto: UpdateGambarBenefitDto,
  ) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException('Image Benefit Not Found');
    }
    Object.assign(gambar_benefit, updateGambarBenefitDto);
    return await this.gambarBenefitRepository.save(gambar_benefit);
  }

  async remove(gambarBenefitId: number) {
    const gambar_benefit = await this.findOne(gambarBenefitId);
    if (!gambar_benefit) {
      throw new NotFoundException();
    }
    return await this.gambarBenefitRepository.remove(gambar_benefit);
  }
}
