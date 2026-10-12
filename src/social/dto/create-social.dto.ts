import { IsEmail, IsString } from 'class-validator';

export class CreateSocialDto {
  @IsString()
  linkedin: string;

  @IsString()
  instagram: string;

  @IsString()
  videoYoutube: string;

  @IsString()
  youtube: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  linkAddress: string;

  @IsString()
  number: string;
}
