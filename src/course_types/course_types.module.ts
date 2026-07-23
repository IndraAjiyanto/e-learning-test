import { Module } from '@nestjs/common';
import { CourseTypesService } from './course_types.service';
import { CourseTypesController } from './course_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseType } from 'src/entities/course_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseType])],
  controllers: [CourseTypesController],
  providers: [CourseTypesService],
  exports: [CourseTypesService],
})
export class CourseTypesModule {}
