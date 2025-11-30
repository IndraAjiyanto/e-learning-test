import { IsArray, IsString } from 'class-validator';

export class CreateVisiDto {
  @IsArray()
  visi: string[];
}
