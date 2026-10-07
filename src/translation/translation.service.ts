import { Injectable } from '@nestjs/common';
import { CreateTranslationDto } from './dto/create-translation.dto';

@Injectable()
export class TranslationService {
  translate(_createTranslationDto: CreateTranslationDto) {
    void _createTranslationDto;
    // stub
  }
}
