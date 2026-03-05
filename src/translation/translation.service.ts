import { Injectable } from '@nestjs/common';
import { CreateTranslationDto } from './dto/create-translation.dto';

@Injectable()
export class TranslationService {
  async translate(createTranslationDto: CreateTranslationDto) {}
}
