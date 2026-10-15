import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alumni } from 'src/entities/alumni.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { ALUMNI_RATINGS, AlumniRating } from 'src/entities/types/alumni-rating';
import * as fs from 'fs/promises';
import * as path from 'path';

const DEFAULT_RATING: AlumniRating = '5';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Kolom `rating` bertipe enum di Postgres, jadi nilai dari form harus sudah
   * berupa string '1'..'5'. Tidak ada global ValidationPipe di main.ts sehingga
   * decorator pada DTO tidak aktif runtime — karena itu koersi dilakukan di sini.
   * Nilai kosong (form lama / data preseed) jatuh ke default 5.
   */
  private resolveRating(value: unknown): AlumniRating {
    if (value === undefined || value === null || value === '') {
      return DEFAULT_RATING;
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }

    const normalized = String(value).trim() as AlumniRating;
    if (!ALUMNI_RATINGS.includes(normalized)) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }

    return normalized;
  }

  async create(createAlumnusDto: CreateAlumnusDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createAlumnusDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    const alumni = this.alumniRepository.create({
      ...createAlumnusDto,
      rating: this.resolveRating(createAlumnusDto.rating),
      course: course,
    });
    await this.alumniRepository.save(alumni);
  }

  async findAll() {
    return await this.alumniRepository.find({ relations: ['course'] });
  }

  async findAllCourses() {
    return await this.courseRepository.find();
  }

  async findCourseByKategori(categoryId: string) {
    return await this.courseRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findOne(alumniId: string) {
    const alumni = await this.alumniRepository.findOne({
      where: { id: alumniId },
      relations: ['course', 'course.category'],
    });
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }
    return alumni;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  async update(alumniId: string, updateAlumnusDto: UpdateAlumnusDto) {
    const alumni = await this.findOne(alumniId);
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }

    const { courseId, rating, ...rest } = updateAlumnusDto;
    Object.assign(alumni, rest);

    // Rating tidak dikirim bila form versi lama atau pemanggil lain tidak
    // menyertakannya — dalam hal itu nilai tersimpan dibiarkan, bukan di-overwrite.
    if (rating !== undefined) {
      alumni.rating = this.resolveRating(rating);
    }

    if (courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException('Program not found');
      }
      alumni.course = course;
    }

    return await this.alumniRepository.save(alumni);
  }

  async remove(alumniId: string) {
    const alumni = await this.findOne(alumniId);
    if (!alumni) {
      throw new NotFoundException('Alumni not found');
    }
    return await this.alumniRepository.remove(alumni);
  }

  async filterAlumni(
    kategoriId?: string,
    courseId?: string,
    search?: string,
    page: number = 1,
    limit: number = 6,
  ) {
    let query = this.alumniRepository
      .createQueryBuilder('alumni')
      .leftJoinAndSelect('alumni.kelas', 'kelas')
      .leftJoinAndSelect('kelas.kategori', 'kategori');

    // Filter by kelas first (most specific)
    if (courseId) {
      query = query.where('alumni.kelas_id = :courseId', { courseId });
    }
    // Then by kategori (if no kelas specified)
    else if (kategoriId) {
      query = query.where('kelas.kategori_id = :kategoriId', { kategoriId });
    }

    // Search filter
    if (search && search.trim()) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.andWhere(
        '(LOWER(alumni.nama) LIKE :search OR LOWER(alumni.posisi_sekarang) LIKE :search)',
        { search: searchLower },
      );
    }

    // Order by ID descending
    query = query.orderBy('alumni.createdAt', 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
