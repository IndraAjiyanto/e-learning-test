import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeknologiDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  svg: string;
}
