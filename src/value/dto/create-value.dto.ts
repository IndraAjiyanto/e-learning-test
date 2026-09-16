import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateValueDto {
  // Dikirim form sebagai title[id]/[en]/[ja] dan description[id]/[en]/[ja].
  @IsObject()
  title: { id: string; en: string; ja: string };

  @IsObject()
  description: { id: string; en: string; ja: string };

  @IsString()
  icon: string;

  // Diisi ValueService (max + 1 saat create, di-reindex saat delete), bukan form.
  @IsOptional()
  @IsNumber()
  valueOrder?: number;
}
