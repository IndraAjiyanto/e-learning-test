import { IsString } from 'class-validator';

export class CreateVisiDto {
  @IsString()
  visi: string;
}
