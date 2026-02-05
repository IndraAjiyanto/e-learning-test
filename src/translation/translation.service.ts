import { Injectable } from '@nestjs/common';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TranslationService {

  async translate(createTranslationDto: CreateTranslationDto) {}

}
