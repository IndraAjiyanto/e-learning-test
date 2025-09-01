import { Module } from '@nestjs/common';
import { JawabansService } from './jawabans.service';
import { JawabansController } from './jawabans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jawaban } from 'src/entities/jawaban.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pertanyaan, Jawaban])],
  controllers: [JawabansController],
  providers: [JawabansService],
    exports: [JawabansService]

})
export class JawabansModule {}
