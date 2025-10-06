import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Mentor, Kelas])],
  controllers: [MentorController],
  providers: [MentorService],
  exports: [MentorService]
})
export class MentorModule {}
