import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InHouseTrainingService } from './in_house_training.service';
import { CreateInHouseTrainingDto } from './dto/create-in_house_training.dto';
import { UpdateInHouseTrainingDto } from './dto/update-in_house_training.dto';

@Controller('in-house-training')
export class InHouseTrainingController {
  constructor(private readonly inHouseTrainingService: InHouseTrainingService) {}

  @Post()
  create(@Body() createInHouseTrainingDto: CreateInHouseTrainingDto) {
    return this.inHouseTrainingService.create(createInHouseTrainingDto);
  }

  @Get()
  findAll() {
    return this.inHouseTrainingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inHouseTrainingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInHouseTrainingDto: UpdateInHouseTrainingDto) {
    return this.inHouseTrainingService.update(+id, updateInHouseTrainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inHouseTrainingService.remove(+id);
  }
}
