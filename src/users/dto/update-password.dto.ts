import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  password_lama: string;

  @IsString()
  password_baru: string;
}
