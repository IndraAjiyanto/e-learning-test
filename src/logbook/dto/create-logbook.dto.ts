import { IsEnum, IsInt, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateLogbookDto {
  @IsString()
  activity: string;

  @IsString()
  activityDetails: string;

  @IsOptional()
  @IsString()
  documentation?: string | null;

  @IsUrl({ require_protocol: true })
  otherDocumentation: string;

  @IsString()
  obstacles: string;

  @IsOptional() // Tambahkan opsional untuk update
  @IsUUID()
  userId: string;

  @IsOptional() // Tambahkan opsional untuk update
  @IsEnum(['approved', 'process', 'rejected'])
  process: ProcessStatus;

  @IsOptional() // Tambahkan opsional untuk update
  @IsUUID()
  sessionId: string;
}
