import { IsBooleanString, IsInt, IsString } from 'class-validator';

export class CreateWeeksDto {
  @IsString()
  keterangan: string;

  @IsInt()
  minggu_ke: number;

  @IsBooleanString()
  akhir: boolean;

  @IsString()
  akhir_check: string;
}
