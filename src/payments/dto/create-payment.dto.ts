import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['acc', 'proces', 'rejected'])
  @IsOptional()
  process: Proses;

  @IsInt()
  userId: number;

  @IsInt()
  courseId: number;

  @IsInt()
  @IsOptional()
  installmentId: number;

  @IsString()
  @IsOptional()
  no: string;
}
