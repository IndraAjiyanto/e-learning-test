import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommitmentDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsString()
  icon: string;
}
