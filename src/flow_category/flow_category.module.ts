import { Module } from '@nestjs/common';
import { FlowCategoryService } from './flow_category.service';
import { FlowCategoryController } from './flow_category.controller';

@Module({
  controllers: [FlowCategoryController],
  providers: [FlowCategoryService],
})
export class FlowCategoryModule {}
