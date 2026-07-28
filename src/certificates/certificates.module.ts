import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Certificates } from 'src/entities/certificate.entity';
import { Biodata } from 'src/entities/biodata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, Certificates, Biodata])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
