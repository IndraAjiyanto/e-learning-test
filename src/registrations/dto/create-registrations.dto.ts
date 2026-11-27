import {
  IsBooleanString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class CreateRegistrationsDto {
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

  @IsString()
  user_fullname: string;

  @IsString()
  user_email: string;

  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, {
    message:
      'Nomor WhatsApp tidak valid. Gunakan format diawali 08, 628, atau +628 dengan panjang minimal 10 digit.',
  })
  user_no: string;

  @IsString()
  current_status: string;

  @IsBooleanString()
  attend_program: boolean;

  @IsString()
  @IsOptional()
  no?: string;

  @IsString()
  referal_source: string;
}
