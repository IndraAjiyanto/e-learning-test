import { Module } from '@nestjs/common';
import { AbsensService } from './absens.service';
import { AbsensController } from './absens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absen } from 'src/entities/absen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absen])],
  controllers: [AbsensController],
  providers: [AbsensService],
})
export class AbsensModule {}
