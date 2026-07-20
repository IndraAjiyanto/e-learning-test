import { PartialType } from '@nestjs/mapped-types';
import { CreateJawabanUserDto } from './create-jawaban_user.dto';

export class UpdateJawabanUserDto extends PartialType(CreateJawabanUserDto) {}
