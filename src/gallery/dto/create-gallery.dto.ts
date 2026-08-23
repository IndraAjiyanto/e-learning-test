import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
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
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsEnum([ '1', '2', '3', '4', '5', '6' ])
  no:noGallery
}
