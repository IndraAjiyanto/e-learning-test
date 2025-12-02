import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  profile: string;

  @IsString()
  nama: string;

  @IsArray()
  posisi: string[];

  @IsNumber()
  team_ke: number;

  @IsString()
  linkedin: string;

  @IsString()
  @IsOptional()
  instagram: string;

  @IsArray()
  @IsOptional()
  deskripsi: string[];
}
