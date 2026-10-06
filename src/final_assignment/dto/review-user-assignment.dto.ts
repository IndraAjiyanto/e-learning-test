import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProcessStatus } from 'src/entities/types/process-status';

export class ReviewUserAssignmentDto {
  @IsNotEmpty()
  @IsEnum(['approved', 'process', 'rejected'])
  status: ProcessStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}

