import { Injectable } from '@nestjs/common';
import { CreateLogbookMentorDto } from './dto/create-logbook_mentor.dto';
import { UpdateLogbookMentorDto } from './dto/update-logbook_mentor.dto';

@Injectable()
export class LogbookMentorService {
  create(createLogbookMentorDto: CreateLogbookMentorDto) {
    return 'This action adds a new logbookMentor';
  }

  findAll() {
    return `This action returns all logbookMentor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logbookMentor`;
  }

  update(id: number, updateLogbookMentorDto: UpdateLogbookMentorDto) {
    return `This action updates a #${id} logbookMentor`;
  }

  remove(id: number) {
    return `This action removes a #${id} logbookMentor`;
  }
}
