import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogbookMentorService } from './logbook_mentor.service';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';

@Controller('logbook-mentor')
export class LogbookMentorController {
  constructor(private readonly logbookMentorService: LogbookMentorService) {}

  @Post()
  create(@Body() createLogbookMentorDto: CreateLogbookMentorDto) {
    return this.logbookMentorService.create(createLogbookMentorDto);
  }

  @Get()
  findAll() {
    return this.logbookMentorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logbookMentorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogbookMentorDto: UpdateLogbookMentorDto) {
    return this.logbookMentorService.update(+id, updateLogbookMentorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logbookMentorService.remove(+id);
  }
}
