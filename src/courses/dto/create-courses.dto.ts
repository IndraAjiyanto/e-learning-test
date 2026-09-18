import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Method,
  PROGRAM_TYPES,
  ProgramType,
} from 'src/entities/course.entity';
import { ProcessStatus } from 'src/entities/types/process-status';

/**
 * Kontrak domain untuk pembuatan Program (Course).
 *
 * Satu sumber kebenaran: nama field di sini = kolom entitas `Course`
 * (lihat src/entities/course.entity.ts). Field yang bersifat relasi
 * (categoryId, courseTypeId, technologiesIds, mentoringsId) dipakai untuk
 * resolve entity, sisanya langsung disimpan ke kolom entitas.
 */
export class CreateCoursesDto {
  @IsString()
  name: string;

  @IsString()
  group: string;

  @IsEnum(['online', 'offline'])
  method: Method;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  courseTypeId: string;

  /**
   * Bentuk belajar program. Tidak wajib dikirim: program yang tidak
   * menyebutkannya tetap bootcamp, sama seperti seluruh program yang sudah ada.
   */
  @IsOptional()
  @IsEnum(PROGRAM_TYPES)
  programType?: ProgramType;

  /** Sakelar logbook. Hanya berarti pada program non_bootcamp. */
  @IsOptional()
  @IsBoolean()
  logbookEnabled?: boolean;

  @IsOptional()
  @IsUUID()
  mentoringsId?: string;

  /** jsonb: { id, en, ja } */
  @IsObject()
  description: { id: string; en: string; ja: string };

  /** jsonb: { id, en, ja } */
  @IsObject()
  locations: { id: string; en: string; ja: string };

  @IsString()
  locationLink: string;

  @IsArray()
  @IsString({ each: true })
  materialsId: string[];

  @IsArray()
  @IsString({ each: true })
  materialsEn: string[];

  @IsArray()
  @IsString({ each: true })
  materialsJa: string[];

  @IsArray()
  @IsString({ each: true })
  learningTargetsId: string[];

  @IsArray()
  @IsString({ each: true })
  learningTargetsEn: string[];

  @IsArray()
  @IsString({ each: true })
  learningTargetsJa: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriaId?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriaEn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriaJa?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  technologiesIds?: string[];

  @IsOptional()
  @IsInt()
  month?: number;

  @IsOptional()
  @IsInt()
  day?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  promo?: number;

  @IsOptional()
  @IsInt()
  quota?: number;

  @IsOptional()
  @IsString()
  form?: string;

  @IsOptional()
  @IsBoolean()
  launch?: boolean;

  @IsOptional()
  @IsBoolean()
  checkPaid?: boolean;

  @IsOptional()
  @IsEnum(['approved', 'process', 'rejected'])
  process?: ProcessStatus;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsDateString()
  date_registration?: string;

  @IsOptional()
  @IsString()
  time_start?: string;

  @IsOptional()
  @IsString()
  time_end?: string;
}
