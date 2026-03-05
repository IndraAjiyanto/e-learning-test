import { IsArray, IsEnum } from 'class-validator';
import { No } from 'src/entities/benefit.entity';

export class CreateBenefitDto {
  @IsArray()
  judul: string[];

  @IsArray()
  text: string[];

  @IsEnum([1, 2, 3])
  no: No;
}
