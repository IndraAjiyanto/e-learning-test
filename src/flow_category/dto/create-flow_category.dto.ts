import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateFlowCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsArray()
  title: string[];

  @IsNotEmpty()
  @IsArray()
  description: string[];

  @IsNotEmpty()
  categoryId: number;
}
