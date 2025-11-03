import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { No } from "src/entities/benefit.entity";

export class CreateBenefitDto {
    @IsString()
    judul: string

    @IsString()
    text: string

          @IsEnum([1, 2, 3])
          no: No;
}
