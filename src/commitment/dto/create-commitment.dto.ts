import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateCommitmentDto {
  @IsNotEmpty()
  @IsArray()
  judul: string[];

  @IsNotEmpty()
  @IsArray()
  deskripsi: string[];

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNumber()
  commitment_ke: number;
}
