import { Module } from '@nestjs/common';
import { PertanyaanUmumService } from './pertanyaan_umum.service';
import { PertanyaanUmumController } from './pertanyaan_umum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PertanyaanUmum]) ],
  controllers: [PertanyaanUmumController],
  providers: [PertanyaanUmumService],
  exports: [PertanyaanUmumService]
})
export class PertanyaanUmumModule {}