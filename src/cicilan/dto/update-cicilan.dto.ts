import { PartialType } from '@nestjs/mapped-types';
import { CreateCicilanDto } from './create-cicilan.dto';

export class UpdateCicilanDto extends PartialType(CreateCicilanDto) {}
