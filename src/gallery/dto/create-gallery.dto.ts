import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { noGallery } from 'src/entities/types/no-gallery';

export class CreateGalleryDto {
  @IsOptional()
  @IsString()
  filePath?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(['1', '2', '3', '4', '5', '6'])
  no?: noGallery;
}
