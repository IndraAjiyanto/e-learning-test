import { IsEmail, IsString } from 'class-validator';

export class CreateSocialDto {
  @IsString()
  linkedin: string;

  @IsString()
  instragram: string;

  @IsString()
  youtube: string;

  @IsEmail()
  email: string;

  @IsString()
  alamat: string;

  @IsString()
  nomor: string;
}
