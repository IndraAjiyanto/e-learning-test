import { IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  gambar: string;
}
