import { PartialType } from '@nestjs/mapped-types';
import { CreateTechnologiesDto } from './create-technologies.dto';

export class UpdateTechnologiesDto extends PartialType(CreateTechnologiesDto) {}
