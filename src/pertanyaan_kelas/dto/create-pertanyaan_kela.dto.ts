import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePertanyaanKelaDto {
  @IsArray()
  @IsNotEmpty()
  pertanyaan: string[];

  @IsArray()
  @IsNotEmpty()
  jawaban: string[];

  @IsNumber()
  @IsNotEmpty()
  kelasId: string;
}
