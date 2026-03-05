import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  deskripsi: string;
}
