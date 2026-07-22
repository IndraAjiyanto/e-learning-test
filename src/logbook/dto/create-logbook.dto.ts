import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { Proses } from 'src/entities/logbook.entity';

export class CreateLogbookDto {
  @IsString()
  activity: string;

  @IsString()
  activityDetails: string;

  @IsOptional()
  @IsString()
  documentation?: string | null;

  @IsUrl({require_protocol: true})
  otherDocumentation: string;

  @IsString()
  obstacles: string;
  
@IsOptional() // Tambahkan opsional untuk update
  @Type(() => Number) // <--- 2. Tambahkan ini agar string "1" jadi angka 1
  @IsInt()
  userId: number;

  @IsOptional() // Tambahkan opsional untuk update
  @IsEnum(['acc', 'proces', 'rejected'])
  process: Proses;

 @IsOptional() // Tambahkan opsional untuk update
  @Type(() => Number) // <--- 3. Tambahkan ini juga
  @IsInt()
  sessionId: number;
}
