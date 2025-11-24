import { IsString, IsNumber } from 'class-validator';

export class CreatePertanyaanUmumDto {
  @IsString()
  pertanyaan: string;

  @IsString()
  jawaban: string;

  @IsNumber()
  kategoriId: number;
}
