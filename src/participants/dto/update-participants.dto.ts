import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantsDto } from './create-participants.dto';

export class UpdateParticipantsDto extends PartialType(CreateParticipantsDto) {}
