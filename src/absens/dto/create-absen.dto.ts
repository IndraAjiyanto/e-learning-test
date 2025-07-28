import { IsEnum, IsOptional, IsString } from "class-validator";

export enum StatusAbsensi {
  IZIN = 'izin',
  HADIR = 'hadir',
  AKIT = 'akit',
  ALFA = 'alfa',
  TIDAK_HADIR = 'tidak_hadir',
}

export class CreateAbsenDto {
    @IsEnum(StatusAbsensi)
    @IsOptional()
    status?: StatusAbsensi =  StatusAbsensi.TIDAK_HADIR;
}
