import { Module } from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { SertifikatController } from './sertifikat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Sertifikat } from 'src/entities/sertifikat.entity';
import { Biodata } from 'src/entities/biodata.entity';

@Module({
      imports: [TypeOrmModule.forFeature([Kelas, User, Sertifikat, Biodata])],
  controllers: [SertifikatController],
  providers: [SertifikatService],
  exports: [SertifikatService]
})
export class SertifikatModule {}
