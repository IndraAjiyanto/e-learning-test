import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateCommitmentDto {
  @IsNotEmpty()
  @IsArray()
  title: string[];

  @IsNotEmpty()
  @IsArray()
  description: string[];

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNumber()
  commitment_order: number;
}
