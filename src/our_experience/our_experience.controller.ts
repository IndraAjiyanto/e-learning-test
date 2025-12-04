import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OurExperienceService } from './our_experience.service';
import { CreateOurExperienceDto } from './dto/create-our_experience.dto';
import { UpdateOurExperienceDto } from './dto/update-our_experience.dto';

@Controller('our-experience')
export class OurExperienceController {
  constructor(private readonly ourExperienceService: OurExperienceService) {}

  @Post()
  create(@Body() createOurExperienceDto: CreateOurExperienceDto) {
    return this.ourExperienceService.create(createOurExperienceDto);
  }

  @Get()
  findAll() {
    return this.ourExperienceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ourExperienceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOurExperienceDto: UpdateOurExperienceDto) {
    return this.ourExperienceService.update(+id, updateOurExperienceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ourExperienceService.remove(+id);
  }
}
