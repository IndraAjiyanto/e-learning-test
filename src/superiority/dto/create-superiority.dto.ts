import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSuperiorityDto {
  @IsNotEmpty()
  @IsArray()
  title: string[];

  @IsNotEmpty()
  @IsArray()
  description: string[];

  @IsNotEmpty()
  kategoriId: string;
}
