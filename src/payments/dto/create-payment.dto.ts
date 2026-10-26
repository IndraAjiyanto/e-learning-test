import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';
import { CURRENT_STATUS_OPTIONS } from 'src/entities/payment.entity';

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

  @IsEnum(CURRENT_STATUS_OPTIONS)
  @IsOptional()
  current_status: (typeof CURRENT_STATUS_OPTIONS)[number];

  @IsString()
  @IsOptional()
  promoCode?: string;
}
