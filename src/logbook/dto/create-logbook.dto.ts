import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

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
  @IsEnum(['approved', 'process', 'rejected'])
  process: ProcessStatus;

 @IsOptional() // Tambahkan opsional untuk update
  @Type(() => Number) // <--- 3. Tambahkan ini juga
  @IsInt()
  sessionId: number;
}
