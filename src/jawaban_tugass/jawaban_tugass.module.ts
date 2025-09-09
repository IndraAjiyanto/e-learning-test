import { Module } from '@nestjs/common';
import { JawabanTugassService } from './jawaban_tugass.service';
import { JawabanTugassController } from './jawaban_tugass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Tugas } from 'src/entities/tugas.entity';
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';

@Module({
    imports: [TypeOrmModule.forFeature([JawabanTugas, Tugas, User])],
  
  controllers: [JawabanTugassController],
  providers: [JawabanTugassService],
    exports: [JawabanTugassService]
  
})
export class JawabanTugassModule {}
