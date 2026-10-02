import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateMissionDto {
  // Dikirim form sebagai content[id]/[en]/[ja] dan items[id]/[en]/[ja].
  @IsObject()
  content: { id: string; en: string; ja: string };

  @IsObject()
  items: { id: string; en: string; ja: string };

  // Diisi service (max + 1 saat create, di-reindex saat delete), bukan form.
  @IsOptional()
  @IsNumber()
  missionOrder?: number;
}
