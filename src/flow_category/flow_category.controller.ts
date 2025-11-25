import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlowCategoryService } from './flow_category.service';
import { CreateFlowCategoryDto } from './dto/create-flow_category.dto';
import { UpdateFlowCategoryDto } from './dto/update-flow_category.dto';

@Controller('flow-category')
export class FlowCategoryController {
  constructor(private readonly flowCategoryService: FlowCategoryService) {}

  @Post()
  create(@Body() createFlowCategoryDto: CreateFlowCategoryDto) {
    return this.flowCategoryService.create(createFlowCategoryDto);
  }

  @Get()
  findAll() {
    return this.flowCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlowCategoryDto: UpdateFlowCategoryDto) {
    return this.flowCategoryService.update(+id, updateFlowCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flowCategoryService.remove(+id);
  }
}
