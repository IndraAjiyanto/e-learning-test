import { Injectable } from '@nestjs/common';
import { CreateOurExperienceDto } from './dto/create-our_experience.dto';
import { UpdateOurExperienceDto } from './dto/update-our_experience.dto';

@Injectable()
export class OurExperienceService {
  create(createOurExperienceDto: CreateOurExperienceDto) {
    return 'This action adds a new ourExperience';
  }

  findAll() {
    return `This action returns all ourExperience`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ourExperience`;
  }

  update(id: number, updateOurExperienceDto: UpdateOurExperienceDto) {
    return `This action updates a #${id} ourExperience`;
  }

  remove(id: number) {
    return `This action removes a #${id} ourExperience`;
  }
}
