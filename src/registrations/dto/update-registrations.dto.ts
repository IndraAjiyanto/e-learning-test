import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationsDto } from './create-registrations.dto';

export class UpdateRegistrationsDto extends PartialType(CreateRegistrationsDto) {}
