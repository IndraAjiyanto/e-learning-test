import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { JenisFile } from "src/entities/materi.entity";

export class CreateMaterisDto {
    @IsString()
    file: string

  @IsEnum(['video', 'pdf', 'ppt'])
  @IsOptional()
  jenis_file: JenisFile;

    @IsNumber()
    kelasId: number
}
