import { IsNumber, IsString } from "class-validator";

export class CreateAwardDto {
  @IsString()
  content: string;

  @IsString()
  isi: string;

  @IsNumber()
  award_ke: number;
}
