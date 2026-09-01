import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/pendaftaran.entity';

export class CreatePendaftaranDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['acc', 'proces', 'rejected'])
  @IsOptional()
  proses: Proses;

  @IsInt()
  userId: string;

  @IsInt()
  kelasId: string;
}
