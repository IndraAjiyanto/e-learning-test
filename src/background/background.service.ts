import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background } from '../entities/background.entity';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';

// Tidak ada ValidationPipe global, jadi DTO tidak memvalidasi isi form.
const LANGS = ['id', 'en', 'ja'] as const;
const MAX_LENGTH = 255;
const FIELD_LABEL = { content: 'Content', details: 'Text' } as const;

type LocalizedText = Record<(typeof LANGS)[number], string>;

@Injectable()
export class BackgroundService {
  constructor(
    @InjectRepository(Background)
    private backgroundRepository: Repository<Background>,
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

  async create(createBackgroundDto: CreateBackgroundDto): Promise<Background> {
    const background = this.backgroundRepository.create({
      backgroundOrder: createBackgroundDto.backgroundOrder,
      content: this.parseLocalized('content', createBackgroundDto.content),
      details: this.parseLocalized('details', createBackgroundDto.details),
    } as unknown as Partial<Background>);
    return await this.backgroundRepository.save(background);
  }

  async noBackground() {
    const background_old = await this.backgroundRepository.find({
      order: { backgroundOrder: 'DESC' },
      take: 1,
    });
    if (!background_old || background_old.length === 0) {
      return 0;
    }
    const background_new = background_old[0].backgroundOrder + 1;
    return background_new;
  }

  async findAll(): Promise<Background[]> {
    // Tanpa klausa order, Postgres mengembalikan baris sesuai urutan fisiknya,
    // dan sebuah UPDATE memindahkan baris itu ke belakang. Akibatnya daftar
    // teracak setiap kali ada yang diedit — halaman list menomori baris dari
    // posisinya, jadi nomor ikut berubah padahal backgroundOrder tidak.
    return await this.backgroundRepository.find({
      order: { backgroundOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Background | null> {
    return await this.backgroundRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<Background | null> {
    // backgroundOrder sengaja tidak ikut: urutan hanya diatur create/remove.
    await this.backgroundRepository.update(id, {
      content: this.parseLocalized('content', updateBackgroundDto.content),
      details: this.parseLocalized('details', updateBackgroundDto.details),
    } as unknown as Partial<Background>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const background = await this.findOne(id);
    if (!background) {
      throw new Error('Background not found');
    }
    await this.backgroundRepository.remove(background);
    const allBackground = await this.backgroundRepository.find();
    for (const item of allBackground) {
      if (item.backgroundOrder > background.backgroundOrder) {
        item.backgroundOrder -= 1;
        await this.backgroundRepository.save(item);
      }
    }
  }
}
