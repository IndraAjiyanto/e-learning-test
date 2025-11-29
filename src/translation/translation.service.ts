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


  /**
   * Get specific translation by key and locale
   */


  /**
   * Get available locales
   */
}
