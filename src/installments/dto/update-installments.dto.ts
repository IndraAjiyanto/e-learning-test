import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentsDto } from './create-installments.dto';

export class UpdateInstallmentsDto extends PartialType(CreateInstallmentsDto) {}
