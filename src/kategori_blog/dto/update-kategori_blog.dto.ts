import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriBlogDto } from './create-kategori_blog.dto';

export class UpdateKategoriBlogDto extends PartialType(CreateKategoriBlogDto) {}
