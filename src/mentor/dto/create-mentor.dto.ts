import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto {
  @IsString()
  nama: string;

  @IsArray()
  posisi: string[];

  @IsString()
  profile: string;

  @IsArray()
  teknologi: string[];

  @IsString()
  linkedin: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  teknologiIds: number[];

  @IsArray()
  deskripsi: string[];

  @IsInt()
  kelasId: number;
}
