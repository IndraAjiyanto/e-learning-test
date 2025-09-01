import { Module } from '@nestjs/common';
import { PertanyaansService } from './pertanyaans.service';
import { PertanyaansController } from './pertanyaans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { PertemuansModule } from 'src/pertemuans/pertemuans.module';
import { JawabansModule } from 'src/jawabans/jawabans.module';
import { Jawaban } from 'src/entities/jawaban.entity';
import { JawabanUsersModule } from 'src/jawaban_users/jawaban_users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pertanyaan, Pertemuan, Jawaban]), PertemuansModule, JawabansModule, JawabanUsersModule],
  controllers: [PertanyaansController],
  providers: [PertanyaansService],
  exports: [PertanyaansService]
})
export class PertanyaansModule {}
