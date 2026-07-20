import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/payment.entity';

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
  courseId: number;

  @IsInt()
  @IsOptional()
  cicilanId: number;

  @IsString()
  @IsOptional()
  no: string;
}
