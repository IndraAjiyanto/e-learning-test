import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Status } from 'src/entities/attendance.entity';

export class CreateAttendanceDto {
  @IsEnum(['permission', 'present', 'sick', 'absent', 'no_information'])
  @IsOptional()
  status?: Status;

  @IsDateString()
  attendanceTime: Date;

  @IsString()
  notes: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  sessionId: string;
}
