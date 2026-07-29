import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './../entities/gallery.entity'
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
     const { category_id, ...rest } = createGalleryDto;
    const gallery = this.galleryRepository.create({
        ...rest,
    category: category_id ? { id: category_id } as any : null,
      });
    return this.galleryRepository.save(gallery);
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find({
      relations: ['category'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery dengan id ${id} tidak ditemukan`);
    }

    return gallery;
  }

  async findByKategori(categoryId: number): Promise<Gallery[]> {
  return this.galleryRepository.find({
    where: { category: { id: categoryId } },
    relations: ['category'],
    order: { id: 'DESC' },
  });
}

 async update(
  galleryId: number,
  updateGalleryDto: UpdateGalleryDto & { filePath?: string },
): Promise<Gallery> {
  const gallery = await this.findOne(galleryId);
  const { category_id, ...rest } = updateGalleryDto;

  Object.assign(gallery, rest);

  if (category_id !== undefined) {
    gallery.category = category_id ? ({ id: category_id } as any) : null;
  }

  return this.galleryRepository.save(gallery);
}

  async remove(id: number): Promise<void> {
    const gallery = await this.findOne(id);
    await this.galleryRepository.remove(gallery);
  }
}