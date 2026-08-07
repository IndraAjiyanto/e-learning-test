import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
