import { PartialType } from '@nestjs/mapped-types';
import { CreateTentangDto } from './create-tentang.dto';

export class UpdateTentangDto extends PartialType(CreateTentangDto) {}
