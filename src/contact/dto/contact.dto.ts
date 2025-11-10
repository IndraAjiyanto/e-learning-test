import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ContactDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message: string;
}
