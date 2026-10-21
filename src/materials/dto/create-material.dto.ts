import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileType } from 'src/entities/materials.entity';

export class CreateMaterialDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  file: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  driveFileId?: string | null;

  @IsArray()
  slides: string[];

  @IsEnum(['video', 'pdf', 'ppt'])
  @IsOptional()
  fileType: FileType;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  syllabusId?: string;
}
