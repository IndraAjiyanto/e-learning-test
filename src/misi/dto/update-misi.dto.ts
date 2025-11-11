import { PartialType } from '@nestjs/mapped-types';
import { CreateMisiDto } from './create-misi.dto';

export class UpdateMisiDto extends PartialType(CreateMisiDto) {}
