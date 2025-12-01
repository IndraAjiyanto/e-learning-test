import { IsArray, IsNumber, IsString } from 'class-validator';

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
  instagram: string;

  @IsArray()
  deskripsi: string[];
}
