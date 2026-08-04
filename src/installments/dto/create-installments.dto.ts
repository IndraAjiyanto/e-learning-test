import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Month } from '../../entities/installment.entity';

export class CreateInstallmentsDto {
  @IsArray()
  @IsNotEmpty()
  price: number[];

  @IsEnum([3])
  @IsNotEmpty()
  month: Month;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsNumber()
  @IsNotEmpty()
  downPayment: number;
}
