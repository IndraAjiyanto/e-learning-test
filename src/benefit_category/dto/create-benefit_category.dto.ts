import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateBenefitCategoryDto {
  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsArray()
  title: string[];

  @IsNotEmpty()
  @IsArray()
  description: string[];

  @IsNotEmpty()
  categoryId: string;
}
