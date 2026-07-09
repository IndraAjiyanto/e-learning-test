import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  gambar: string;

  @IsNotEmpty()
  categoryPartnerId: number;
}
