import { IsEnum, IsOptional, IsString, IsArray, IsDateString, IsNumber } from "class-validator";
import { Status } from "src/entities/absen.entity";

export class CreateAbsenDto {
  @IsEnum(['izin', 'hadir', 'sakit', 'alfa', 'tidak ada keterangan'])
  @IsOptional()
  role?: Status;

    @IsDateString()
    waktu_absen: Date;

    @IsString()
    keterangan: string;

    @IsNumber()
    userId: number;

    @IsNumber()
    pertemuanId: number;
}