import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgresPertemuan,
      Attendance,
      User,
      Pertemuan,
      Kelas,
      ProgresPertemuan,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
