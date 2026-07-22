import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Proses } from 'src/entities/registration.entity';

export class CreateRegistrationsDto {
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
}
