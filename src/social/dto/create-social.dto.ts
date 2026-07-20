import { IsEmail, IsString } from 'class-validator';

export class CreateSocialDto {
  @IsString()
  linkedin: string;

  @IsString()
  instragram: string;

  @IsString()
  video_youtube: string;

  @IsString()
  link_form: string;

  @IsString()
  youtube: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  link_alamat: string;

  @IsString()
  nomor: string;
}
