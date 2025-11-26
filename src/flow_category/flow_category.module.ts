import { Module } from '@nestjs/common';
import { FlowCategoryService } from './flow_category.service';
import { FlowCategoryController } from './flow_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowCategory } from 'src/entities/flow_category.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlowCategory, Kategori])],
  controllers: [FlowCategoryController],
  providers: [FlowCategoryService],
})
export class FlowCategoryModule {}
