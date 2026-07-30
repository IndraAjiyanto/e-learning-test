import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  image: string;

  @IsNotEmpty()
  categoryPartnerId: number;
}
