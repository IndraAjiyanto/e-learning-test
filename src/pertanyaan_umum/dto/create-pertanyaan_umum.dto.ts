import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreatePertanyaanUmumDto {
  @IsArray()
  pertanyaan: string[];

  @IsArray()
  jawaban: string[];

  @IsNumber()
  kategoriId: string;
}
