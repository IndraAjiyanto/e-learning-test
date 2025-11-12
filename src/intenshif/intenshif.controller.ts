import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IntenshifService } from './intenshif.service';
import { CreateIntenshifDto } from './dto/create-intenshif.dto';
import { UpdateIntenshifDto } from './dto/update-intenshif.dto';

@Controller('intenshif')
export class IntenshifController {
  constructor(private readonly intenshifService: IntenshifService) {}

  @Post()
  create(@Body() createIntenshifDto: CreateIntenshifDto) {
    return this.intenshifService.create(createIntenshifDto);
  }

  @Get()
  findAll() {
    return this.intenshifService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.intenshifService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntenshifDto: UpdateIntenshifDto,
  ) {
    return this.intenshifService.update(+id, updateIntenshifDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.intenshifService.remove(+id);
  }
}
