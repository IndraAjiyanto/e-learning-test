import { Module } from '@nestjs/common';
import { FlowCategoryService } from './flow_category.service';
import { FlowCategoryController } from './flow_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Category } from 'src/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlowCategory, Category])],
  controllers: [FlowCategoryController],
  providers: [FlowCategoryService],
})
export class FlowCategoryModule {}
