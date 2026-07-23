import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTechnologiesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  svg?: string | null;

  @IsString()
  @IsOptional()
  img_url?: string | null;
}
