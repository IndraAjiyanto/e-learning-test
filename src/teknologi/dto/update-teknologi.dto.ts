import { PartialType } from '@nestjs/mapped-types';
import { CreateTeknologiDto } from './create-teknologi.dto';

export class UpdateTeknologiDto extends PartialType(CreateTeknologiDto) {}
