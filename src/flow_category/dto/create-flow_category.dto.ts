import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFlowCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  kategoriId: number;
}
