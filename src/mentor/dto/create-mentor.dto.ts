import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto {
  @IsString()
  nama: string;

  @IsString()
  posisi: string;

  @IsString()
  profile: string;

  @IsString()
  ttd: string;

  @IsString()
  teknologi: string[];

  @IsString()
  linkedin: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  teknologiIds: number[];

  @IsString()
  github: string;

  @IsString()
  deskripsi: string;

  @IsInt()
  kelasId: number;
}
