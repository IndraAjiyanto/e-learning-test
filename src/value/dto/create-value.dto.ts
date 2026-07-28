import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateValueDto {
  @IsArray()
  title: string[];

  @IsArray()
  description: string[];

  @IsString()
  icon: string;

  @IsNumber()
  valueOrder: number;
}
