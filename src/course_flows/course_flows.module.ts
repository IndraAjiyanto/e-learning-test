import { Module } from '@nestjs/common';
import { CourseFlowsService } from './course_flows.service';
import { CourseFlowsController } from './course_flows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseFlow, Course])],
  controllers: [CourseFlowsController],
  providers: [CourseFlowsService],
})
export class CourseFlowsModule {}
