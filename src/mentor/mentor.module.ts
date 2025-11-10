import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { CommonModule } from 'src/common/common.module';
import { Teknologi } from 'src/entities/teknologi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor, Kelas, Teknologi]), CommonModule],
  controllers: [MentorController],
  providers: [MentorService],
  exports: [MentorService],
})
export class MentorModule {}
