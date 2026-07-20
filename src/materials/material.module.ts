import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/entities/materials.entity';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { LibreOfficeService } from 'src/common/config/libreoffice.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Material, Course, Session]), CommonModule],
  controllers: [MaterialController],
  providers: [MaterialService, LibreOfficeService],
  exports: [MaterialService],
})
export class MaterialsModule {}
