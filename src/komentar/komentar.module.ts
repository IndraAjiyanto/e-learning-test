import { Module } from '@nestjs/common';
import { KomentarService } from './komentar.service';
import { KomentarController } from './komentar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';
import { Komentar } from 'src/entities/komentar.entity';

@Module({
    imports: [TypeOrmModule.forFeature([JawabanTugas, Komentar])],
  controllers: [KomentarController],
  providers: [KomentarService],
  exports: [KomentarService]
})
export class KomentarModule {}
