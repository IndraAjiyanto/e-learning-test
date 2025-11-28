import { Injectable } from '@nestjs/common';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Translation } from 'src/entities/translation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  async translate(createTranslationDto: CreateTranslationDto) {}

  /**
   * Get all translations for a specific locale
   * Returns object with key-value pairs: { 'key': 'translated_value' }
   */
  async getTranslations(locale: string = 'id'): Promise<Record<string, any>> {
    const translations = await this.translationRepository.find({
      where: { locale },
      relations: ['tentang'], // Add other relations as needed
    });

    const result: Record<string, any> = {};

    for (const trans of translations) {
      // If it has tentang relation, use tentang data
      if (trans.tentang) {
        result[trans.key] = {
          judul: trans.tentang.judul,
          text: trans.tentang.text,
          gambar: trans.tentang.gambar,
        };
      } else {
        // For future entities without specific relations
        result[trans.key] = trans;
      }
    }

    return result;
  }

  /**
   * Get specific translation by key and locale
   */
  async getTranslation(key: string, locale: string = 'id'): Promise<any> {
    const translation = await this.translationRepository.findOne({
      where: { key, locale },
      relations: ['tentang'], // Add other relations as needed
    });

    if (!translation) {
      return null;
    }

    // If it has tentang relation, return tentang data
    if (translation.tentang) {
      return {
        judul: translation.tentang.judul,
        text: translation.tentang.text,
        gambar: translation.tentang.gambar,
      };
    }

    return translation;
  }

  /**
   * Get available locales
   */
  async getAvailableLocales(): Promise<string[]> {
    const locales = await this.translationRepository
      .createQueryBuilder('translation')
      .select('DISTINCT translation.locale', 'locale')
      .getRawMany();

    return locales.map((l) => l.locale);
  }
}
