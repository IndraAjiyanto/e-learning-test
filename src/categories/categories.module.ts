import { Module } from '@nestjs/common';
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
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Superiority } from 'src/entities/superiority.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Superiority,
      CourseFlow,
      BenefitCategory,
      Course,
      CourseType,
      Alumni,
      CategoryFaq,
      FlowCategory,
      Gallery,
    ]),
    CommonModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
