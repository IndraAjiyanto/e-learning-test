import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portofolios } from 'src/entities/portofolios.entity';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { CommonModule } from 'src/common/common.module';
import { FinalAssignmentModule } from 'src/final_assignment/final_assignment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portofolios,
      User,
      Course,
      Category,
      CourseType,
      UserCourse,
    ]),
    CommonModule,
    FinalAssignmentModule,
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
