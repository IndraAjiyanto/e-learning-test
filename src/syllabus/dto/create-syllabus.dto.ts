import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSyllabusDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  content?: string | object | null;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' || value === true || value === 1 || value === '1',
  )
  @IsBoolean()
  isFinal?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined,
  )
  @IsNumber()
  syllabusNumber?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoDuration?: string;

  @IsOptional()
  @IsString()
  pdfFile?: string;

  @IsOptional()
  @IsString()
  pdfOriginalName?: string;

  @IsOptional()
  pdfFileSize?: number | string;

  @IsOptional()
  @IsString()
  pptFile?: string;

  @IsOptional()
  @IsString()
  pptOriginalName?: string;

  @IsOptional()
  pptFileSize?: number | string;

  @IsOptional()
  @IsString()
  pptDriveFileId?: string;

  @IsOptional()
  @IsString()
  pptUrl?: string;
}
