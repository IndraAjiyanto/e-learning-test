import { IsEnum, IsString } from 'class-validator';
import { No } from 'src/entities/gambar_benefit.entity';

export class CreateGambarBenefitDto {
  @IsString()
  gambar: string;

  @IsEnum([1, 2, 3, 4])
  no: No;
}
