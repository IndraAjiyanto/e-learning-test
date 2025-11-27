import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSuperiorityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  kategoriId: number;
}
