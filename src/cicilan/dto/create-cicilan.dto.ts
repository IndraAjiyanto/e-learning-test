import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Bulan } from '../../entities/cicilan.entity';

export class CreateCicilanDto {
  @IsArray()
  @IsNotEmpty()
  harga: number[];

  @IsEnum([3, 6, 12])
  @IsNotEmpty()
  bulan: Bulan;

  @IsNumber()
  @IsNotEmpty()
  kelasId: string;

  @IsNumber()
  @IsNotEmpty()
  dp: number;
}
