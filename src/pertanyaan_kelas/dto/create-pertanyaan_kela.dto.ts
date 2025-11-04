import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePertanyaanKelaDto {
  @IsString()
  @IsNotEmpty()
  pertanyaan: string;

  @IsString()
  @IsNotEmpty()
  jawaban: string;

  @IsNumber()
  @IsNotEmpty()
  kelasId: number;
}
