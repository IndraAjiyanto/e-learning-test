import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommitmentDto {
  // Dikirim form sebagai title[id]/[en]/[ja] dan description[id]/[en]/[ja].
  @IsNotEmpty()
  @IsObject()
  title: { id: string; en: string; ja: string };

  @IsNotEmpty()
  @IsObject()
  description: { id: string; en: string; ja: string };

  @IsNotEmpty()
  @IsString()
  icon: string;

  // Diisi CommitmentService (max + 1 saat create, di-reindex saat delete).
  @IsOptional()
  @IsNumber()
  commitmentOrder?: number;
}
