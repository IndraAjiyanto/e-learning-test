import { PartialType } from '@nestjs/mapped-types';
import { CreatePembayaranDto } from './create-pembayaran.dto';

export class UpdatePembayaranDto extends PartialType(CreatePembayaranDto) {}
