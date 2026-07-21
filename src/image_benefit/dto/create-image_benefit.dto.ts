import { IsEnum, IsString } from 'class-validator';
import { No } from 'src/entities/image_benefit.entity';

export class CreateImageBenefitDto {
  @IsString()
  image: string;

  @IsEnum([1, 2, 3, 4])
  no: No;
}
