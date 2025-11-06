import { PartialType } from '@nestjs/mapped-types';
import { CreateWipDto } from './create-wip.dto';

export class UpdateWipDto extends PartialType(CreateWipDto) {}
