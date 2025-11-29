import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateBenefitKelaDto {
  @IsArray()
  benefit: string[];

  @IsString()
  icon: string;

  @IsArray()
  isi: string[];

  @IsInt()
  kelasId: number;
}
