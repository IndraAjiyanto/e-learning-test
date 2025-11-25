import { Injectable } from '@nestjs/common';
import { CreateFlowCategoryDto } from './dto/create-flow_category.dto';
import { UpdateFlowCategoryDto } from './dto/update-flow_category.dto';

@Injectable()
export class FlowCategoryService {
  create(createFlowCategoryDto: CreateFlowCategoryDto) {
    return 'This action adds a new flowCategory';
  }

  findAll() {
    return `This action returns all flowCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flowCategory`;
  }

  update(id: number, updateFlowCategoryDto: UpdateFlowCategoryDto) {
    return `This action updates a #${id} flowCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} flowCategory`;
  }
}
