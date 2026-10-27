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
  IsUrl,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Method, PROGRAM_TYPES, ProgramType } from 'src/entities/course.entity';
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
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Group link must be a valid URL (http/https)' },
  )
  group: string;

  @IsEnum(['online', 'offline'])
  method: Method;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  courseTypeId?: string;

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

  /** jsonb: { id, en, ja }. Opsional - kolom `locations` nullable. */
  @IsOptional()
  @IsObject()
  locations: { id: string; en: string; ja: string };

  /** Opsional - kolom `locationLink` nullable. */
  @IsOptional()
  @ValidateIf((o: CreateCoursesDto) => Boolean(o.locationLink))
  @IsString()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true, require_tld: true },
    { message: 'Link location must be a valid URL' },
  )
  locationLink?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialsId?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialsEn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialsJa?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningTargetsId?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningTargetsEn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningTargetsJa?: string[];

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

  @ValidateIf((o: CreateCoursesDto) => !o.checkPaid)
  @IsInt()
  @Min(1, { message: 'Day must be between 1 and 31' })
  @Max(31, { message: 'Day must be between 1 and 31' })
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
  @Min(1, { message: 'Program quota must be greater than 0' })
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
