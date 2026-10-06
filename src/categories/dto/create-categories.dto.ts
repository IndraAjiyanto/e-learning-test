import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  name: string;

  // Nama kategori per bahasa; `name` di atas tetap Indonesia. Nullable di DB
  // karena data lama sudah ada sebelum kolom ditambahkan.
  @IsOptional()
  @IsString()
  name_en?: string | null;

  @IsOptional()
  @IsString()
  name_ja?: string | null;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  hero_section_image?: string;

  @IsArray()
  description: string[];

  @IsOptional()
  @IsArray()
  text?: string[];

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  courseType?: string[];

  @IsEnum(['Special Program', 'Paid Program', 'Free Program'])
  type: 'Special Program' | 'Paid Program' | 'Free Program';
}

