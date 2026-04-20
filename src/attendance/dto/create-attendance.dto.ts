import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Status } from 'src/entities/attendance.entity';

export class CreateAttendanceDto {
  @IsEnum(['permission', 'present', 'sick', 'absent', 'no_information'])
  @IsOptional()
  role?: Status;

  @IsDateString()
  time_attendance: Date;

  @IsString()
  description: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  pertemuanId: number;
}
