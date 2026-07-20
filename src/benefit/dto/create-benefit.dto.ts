import { IsArray, IsEnum } from 'class-validator';
import { No } from 'src/entities/benefit.entity';

export class CreateBenefitDto {
  @IsArray()
  title: string[];

  @IsArray()
  description: string[];

  @IsEnum([1, 2, 3])
  no: No;
}
