import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileType } from 'src/entities/materials.entity';

export class CreateMaterialDto {
  @IsString()
  title: string;

  @IsString()
  file: string;

  @IsArray()
  slides: string[];

  @IsEnum(['video', 'pdf', 'ppt'])
  @IsOptional()
  fileType: FileType;

  @IsNumber()
  sessionId: number;
}
