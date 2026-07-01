import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './../entities/gallery.entity'
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
  ) {}

  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
     const { kategori_id, ...rest } = createGalleryDto;
    const gallery = this.galleryRepository.create({
        ...rest,
    kategori: kategori_id ? { id: kategori_id } as any : null,
      });
    return this.galleryRepository.save(gallery);
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find({
      relations: ['kategori'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOne({
      where: { id },
      relations: ['kategori'],
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery dengan id ${id} tidak ditemukan`);
    }

    return gallery;
  }

 async update(
  id: number,
  updateGalleryDto: UpdateGalleryDto & { file_path?: string },
): Promise<Gallery> {
  const gallery = await this.findOne(id);
  const { kategori_id, ...rest } = updateGalleryDto;

  Object.assign(gallery, rest);

  if (kategori_id !== undefined) {
    gallery.kategori = kategori_id ? ({ id: kategori_id } as any) : null;
  }

  return this.galleryRepository.save(gallery);
}

  async remove(id: number): Promise<void> {
    const gallery = await this.findOne(id);
    await this.galleryRepository.remove(gallery);
  }
}