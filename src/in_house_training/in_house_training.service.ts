import { Injectable } from '@nestjs/common';
import { CreateInHouseTrainingDto } from './dto/create-in_house_training.dto';
import { UpdateInHouseTrainingDto } from './dto/update-in_house_training.dto';

@Injectable()
export class InHouseTrainingService {
  create(createInHouseTrainingDto: CreateInHouseTrainingDto) {
    return 'This action adds a new inHouseTraining';
  }

  findAll() {
    return `This action returns all inHouseTraining`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inHouseTraining`;
  }

  update(id: number, updateInHouseTrainingDto: UpdateInHouseTrainingDto) {
    return `This action updates a #${id} inHouseTraining`;
  }

  remove(id: number) {
    return `This action removes a #${id} inHouseTraining`;
  }
}
