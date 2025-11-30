import { IsArray, IsEmail, IsString } from 'class-validator';

export class CreateTeamLeadDto {
  @IsString()
  profile: string;

  @IsString()
  nama: string;

  @IsString()
  posisi: string;

  @IsArray()
  deskripsi: string[];

  @IsString()
  instagram: string;

  @IsString()
  linkedin: string;
}
