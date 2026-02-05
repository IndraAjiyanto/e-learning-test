import { IsArray, IsNumber } from "class-validator";

export class CreateMisiDto {
  @IsArray()
  content: string[];

  @IsNumber()
  misi_ke: number

  @IsArray()
  isi: string[];
}
