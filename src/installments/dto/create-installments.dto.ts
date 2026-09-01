import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { Month } from '../../entities/installment.entity';

export class CreateInstallmentsDto {
  @IsArray()
  @IsNotEmpty()
  price: number[];

  @IsEnum([3])
  @IsNotEmpty()
  month: Month;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsNumber()
  @IsNotEmpty()
  downPayment: number;
}
