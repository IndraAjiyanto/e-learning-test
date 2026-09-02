import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto {
  @IsString()
  nama: string;

  @IsArray()
  @IsOptional()
  posisi: string[];

  @IsString()
  profile: string;

  @IsArray()
  @IsOptional()
  teknologi: string[];

  @IsString()
  linkedin: string;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return [];
    if (Array.isArray(value)) return value.filter((v) => v !== '' && v !== null && v !== undefined);
    return [value];
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  teknologiIds: number[];

  @IsArray()
  @IsOptional()
  deskripsi: string[];

  @IsInt()
  kelasId: number;
}
