import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnologiesDto } from './dto/create-technologies.dto';
import { UpdateTechnologiesDto } from './dto/update-technologies.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from 'src/entities/technology.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectRepository(Technology)
    private readonly technologiesRepository: Repository<Technology>,
  ) {}

  private async deleteFile(url: string | null) {
    if (!url) return;
    try {
      const filePath = path.join(process.cwd(), 'public', url);
      await fs.unlink(filePath);
    } catch (error) {}
  }

  async create(createTechnologiesDto: CreateTechnologiesDto) {
    const technologies = this.technologiesRepository.create(
      createTechnologiesDto,
    );
    return await this.technologiesRepository.save(technologies);
  }

  async findAll() {
    return await this.technologiesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Sumber data tabel /technology (client-side fetch), sejajar dengan
  // CourseTypesService.findAllPaginated.
  //
  // Halaman ini sengaja TIDAK memakai clientTable seperti Benefit: kolom `svg`
  // menyimpan markup SVG utuh (ribuan byte per baris), jadi mengirim seluruh
  // tabel ke dalam HTML lewat {{json technologies}} membuat halaman membengkak
  // seiring bertambahnya teknologi. Paginasi di server menahan payload-nya
  // tetap sebesar satu halaman.
  async findAllPaginated(params: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const query = this.technologiesRepository
      .createQueryBuilder('technology')
      .orderBy('technology.createdAt', 'DESC');

    if (params.search) {
      query.where('technology.name ILIKE :search', {
        search: `%${params.search}%`,
      });
    }

    query.skip((params.page - 1) * params.limit).take(params.limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    const technologies = await this.technologiesRepository.findOne({
      where: { id },
    });
    if (!technologies) {
      throw new NotFoundException('Tech not found');
    }
    return technologies;
  }

  async update(id: string, updateTechnologiesDto: UpdateTechnologiesDto) {
    const technologies = await this.findOne(id);

    if (
      updateTechnologiesDto.imgUrl !== undefined &&
      updateTechnologiesDto.imgUrl !== technologies.imgUrl
    ) {
      await this.deleteFile(technologies.imgUrl);
    }

    Object.assign(technologies, updateTechnologiesDto);
    return await this.technologiesRepository.save(technologies);
  }

  async remove(id: string) {
    const technologies = await this.findOne(id);
    await this.deleteFile(technologies.imgUrl);
    return await this.technologiesRepository.remove(technologies);
  }
}
