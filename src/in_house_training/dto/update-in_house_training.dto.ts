import { PartialType } from '@nestjs/mapped-types';
import { CreateInHouseTrainingDto } from './create-in_house_training.dto';

export class UpdateInHouseTrainingDto extends PartialType(CreateInHouseTrainingDto) {}
