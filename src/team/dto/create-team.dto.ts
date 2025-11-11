import { IsNumber, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  profile: string;

  @IsString()
  nama: string;

  @IsString()
  posisi: string;

  @IsNumber()
  team_ke: number;

  @IsString()
  linkedin: string;

  @IsString()
  github: string;

  @IsString()
  instagram: string;

  @IsString()
  deskripsi: string;
}
