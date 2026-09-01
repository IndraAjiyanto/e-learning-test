import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Status } from 'src/entities/absen.entity';

export class CreateAbsenDto {
  @IsEnum(['permission', 'present', 'sick', 'absent', 'no_information'])
  @IsOptional()
  role?: Status;

  @IsDateString()
  waktu_absen: Date;

  @IsString()
  keterangan: string;

  @IsNumber()
  userId: string;

  @IsNumber()
  pertemuanId: string;
}
