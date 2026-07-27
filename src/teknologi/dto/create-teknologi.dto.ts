import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeknologiDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsOptional()
  svg?: string;

  @IsString()
  @IsOptional()
  img_url?: string;
}
