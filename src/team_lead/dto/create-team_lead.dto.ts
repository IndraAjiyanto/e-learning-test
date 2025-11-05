import { IsEmail, IsString } from 'class-validator';

export class CreateTeamLeadDto {
  @IsString()
  profile: string;

  @IsString()
  nama: string;

  @IsString()
  posisi: string;

  @IsString()
  deskripsi: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  background: string;

  @IsString()
  awards: string;

  @IsString()
  experience: string;

  @IsString()
  linkedin: string;
}
