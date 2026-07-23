import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificatesDto } from './create-certificates.dto';

export class UpdateCertificatesDto extends PartialType(CreateCertificatesDto) {}
