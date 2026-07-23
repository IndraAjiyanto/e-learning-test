import { Module } from '@nestjs/common';
import { ProgramBenefitService } from './course_benefits.service';
import { ProgramBenefitController } from './course_benefits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramBenefits, Course])],
  controllers: [ProgramBenefitController],
  providers: [ProgramBenefitService],
  exports: [ProgramBenefitService],
})
export class ProgramBenefitModule {}
