import { PartialType } from '@nestjs/mapped-types';
import { CreateCollaborationsDto } from './create-collaborations.dto';

export class UpdateCollaborationsDto extends PartialType(CreateCollaborationsDto) {}
