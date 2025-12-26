import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/jawaban_tugas.entity';

export class CreateJawabanTugassDto {
  @IsString()
  file: string;

  @IsString()
  @IsOptional()
  komentar: string;

  @IsInt()
  userId: number;

  @IsInt()
  tugasId: number;

  @IsEnum(['acc', 'proces', 'rejected'])
  proses: Proses;
}
