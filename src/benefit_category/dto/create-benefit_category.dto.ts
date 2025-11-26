import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBenefitCategoryDto {
  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  kategoriId: number;
}
