import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/pembayaran.entity';

export class CreatePembayaranDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['acc', 'proces', 'rejected'])
  @IsOptional()
  proses: Proses;

  @IsInt()
  userId: number;

  @IsInt()
  kelasId: number;

  @IsInt()
  @IsOptional()
  cicilanId: number;

  @IsString()
  @IsOptional()
  no: string;
}
