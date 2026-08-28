import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  file: string;

  @IsEnum(['approved', 'process', 'rejected'])
  @IsOptional()
  process: ProcessStatus;

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
