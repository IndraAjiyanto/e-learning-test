import { PartialType } from '@nestjs/mapped-types';
import { CreateVisionsDto } from './create-vision.dto';

export class UpdateVisionsDto extends PartialType(CreateVisionsDto) {}
