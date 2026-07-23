import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-absen.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
