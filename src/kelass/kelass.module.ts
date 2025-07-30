import { Module } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { KelassController } from './kelass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { PertemuansModule } from 'src/pertemuans/pertemuans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas])],
  controllers: [KelassController],
  providers: [KelassService],
  exports: [KelassService],
})
export class KelassModule {}
