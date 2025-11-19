import { IsNumber, IsString } from "class-validator";

export class CreateMisiDto {
  @IsString()
  content: string;

  @IsNumber()
  misi_ke: number

  @IsString()
  isi: string;
}
