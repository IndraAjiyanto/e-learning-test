import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '../entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

// Tidak ada ValidationPipe global, jadi DTO tidak memvalidasi isi form.
const LANGS = ['id', 'en', 'ja'] as const;
const MAX_LENGTH = 255;
const FIELD_LABEL = { content: 'Content', details: 'Text' } as const;

type LocalizedText = Record<(typeof LANGS)[number], string>;

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
  ) {}

  // Hanya { id, en, ja } yang disimpan; key lain dari body dibuang.
  private parseLocalized(
    field: keyof typeof FIELD_LABEL,
    value: unknown,
  ): LocalizedText {
    const label = FIELD_LABEL[field];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException(`${label} is required.`);
    }

    const source = value as Record<string, unknown>;
    return LANGS.reduce((result, lang) => {
      const text = typeof source[lang] === 'string' ? source[lang].trim() : '';
      const langLabel = lang === 'ja' ? 'JP' : lang.toUpperCase();
      if (!text) {
        throw new BadRequestException(`${label} (${langLabel}) is required.`);
      }
      if (text.length > MAX_LENGTH) {
        throw new BadRequestException(
          `${label} (${langLabel}) must be at most ${MAX_LENGTH} characters.`,
        );
      }
      result[lang] = text;
      return result;
    }, {} as LocalizedText);
  }

  async create(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.experienceRepository.create({
      experienceOrder: createExperienceDto.experienceOrder,
      content: this.parseLocalized('content', createExperienceDto.content),
      details: this.parseLocalized('details', createExperienceDto.details),
    } as unknown as Partial<Experience>);
    return await this.experienceRepository.save(experience);
  }

  async noExperience() {
    const experience_old = await this.experienceRepository.find({
      order: { experienceOrder: 'DESC' },
      take: 1,
    });
    if (!experience_old || experience_old.length === 0) {
      return 0;
    }
    const experience_new = experience_old[0].experienceOrder + 1;
    return experience_new;
  }

  async findAll(): Promise<Experience[]> {
    // Tanpa klausa order, Postgres mengembalikan baris sesuai urutan fisiknya,
    // dan sebuah UPDATE memindahkan baris itu ke belakang. Akibatnya daftar
    // teracak setiap kali ada yang diedit — halaman list menomori baris dari
    // posisinya, jadi nomor ikut berubah padahal experienceOrder tidak.
    return await this.experienceRepository.find({
      order: { experienceOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Experience | null> {
    return await this.experienceRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<Experience | null> {
    // experienceOrder sengaja tidak ikut: urutan hanya diatur create/remove.
    await this.experienceRepository.update(id, {
      content: this.parseLocalized('content', updateExperienceDto.content),
      details: this.parseLocalized('details', updateExperienceDto.details),
    } as unknown as Partial<Experience>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const experience = await this.findOne(id);
    if (!experience) {
      throw new Error('Experience not found');
    }
    await this.experienceRepository.remove(experience);
    const allExperience = await this.experienceRepository.find();
    for (const item of allExperience) {
      if (item.experienceOrder > experience.experienceOrder) {
        item.experienceOrder -= 1;
        await this.experienceRepository.save(item);
      }
    }
  }
}
