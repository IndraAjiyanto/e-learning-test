import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Gallery } from './../entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Category } from 'src/entities/category.entity';
import { noGallery } from 'src/entities/types/no-gallery';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
    const { categoryId, no, ...rest } = createGalleryDto;
    const gallery = this.galleryRepository.create({
      ...rest,
      no: no ?? (await this.nextFreeNo(categoryId)),
      category: categoryId ? { id: categoryId } : null,
    });
    return this.galleryRepository.save(gallery);
  }

  // Layout halaman program punya 6 slot per kategori (lihat
  // CategoriesService.findGalleryByCategory). Bila semua terisi, gambar tetap
  // disimpan di slot 6 agar masih tampil di carousel dan /dashboard/gallery.
  private async nextFreeNo(categoryId?: string): Promise<noGallery> {
    if (!categoryId) return '1';

    const used = await this.galleryRepository.find({
      where: { category: { id: categoryId } },
      select: { id: true, no: true },
    });
    const usedNos = new Set(used.map((g) => g.no));
    const slots: noGallery[] = ['1', '2', '3', '4', '5', '6'];

    return slots.find((slot) => !usedNos.has(slot)) ?? '6';
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find({
      relations: ['category'],
      order: { no: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery dengan id ${id} tidak ditemukan`);
    }

    return gallery;
  }

  async findByKategori(categoryId: string): Promise<Gallery[]> {
    return this.galleryRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
      order: { no: 'ASC' },
    });
  }

  async update(
    galleryId: string,
    updateGalleryDto: UpdateGalleryDto & { filePath?: string },
  ): Promise<Gallery> {
    const gallery = await this.findOne(galleryId);
    const oldFilePath = gallery.filePath;
    const { categoryId, ...rest } = updateGalleryDto;

    Object.assign(gallery, rest);

    if (categoryId !== undefined) {
      gallery.category = categoryId ? ({ id: categoryId } as any) : null;
    }

    const saved = await this.galleryRepository.save(gallery);

    // Hapus file lama hanya jika gambar diganti dengan yang baru
    if (rest.filePath && oldFilePath && rest.filePath !== oldFilePath) {
      await this.deleteFile(oldFilePath);
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const gallery = await this.findOne(id);
    await this.galleryRepository.remove(gallery);
    await this.deleteFile(gallery.filePath);
  }

  private async deleteFile(url?: string): Promise<void> {
    if (!url) return;
    try {
      await fs.unlink(path.join(process.cwd(), 'public', url));
    } catch (error) {
      // file tidak ada / sudah terhapus — abaikan
    }
  }
}
