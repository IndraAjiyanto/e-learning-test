import { IsString, IsNumber } from 'class-validator';

export class CreateValueDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsNumber()
  value_ke: number;
}
