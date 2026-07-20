import { Module } from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { SertifikatController } from './sertifikat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Certificates } from 'src/entities/certificate.entity';
import { Biodata } from 'src/entities/biodata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, Certificates, Biodata])],
  controllers: [SertifikatController],
  providers: [SertifikatService],
  exports: [SertifikatService],
})
export class SertifikatModule {}
