import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Gallery } from 'src/entities/gallery.entity';
import { CommonModule } from 'src/common/common.module';
import { BenefitCategory } from 'src/entities/benefit_category.entity';
import { Course } from 'src/entities/course.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { CategoryFaq } from 'src/entities/faqs.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      CourseFlow,
      BenefitCategory,
      Course,
      CourseType,
      Alumni,
      CategoryFaq,
      Gallery,
      Portofolios,
    ]),
    CommonModule,
    forwardRef(() => CoursesModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
