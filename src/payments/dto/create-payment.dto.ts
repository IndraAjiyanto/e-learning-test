import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['approved', 'process', 'rejected'])
  @IsOptional()
  process: ProcessStatus;

  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  @IsOptional()
  installmentId: string;

  @IsString()
  @IsOptional()
  no: string;

  @IsEnum([
    'Instagram',
    'TikTok',
    'LinkedIn',
    'Friends',
    'University',
    'WhatsApp Group',
    'Webinar/Event',
    'Website',
    'Other',
  ])
  @IsOptional()
  referalSource: string;
}
