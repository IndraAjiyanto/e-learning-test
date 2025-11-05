import { IsString } from 'class-validator';

export class CreateValueDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;
}
