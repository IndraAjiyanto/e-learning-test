import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCourseTypeDto {
  @IsString()
  nameClassesType: string;

  @IsString()
  icon: string;

  // Dikirim form sebagai description[id] / description[en] / description[ja],
  // jadi yang sampai di controller adalah objek — bukan array seperti tipe lama.
  @IsObject()
  description: { id: string; en: string; ja: string };

  @IsOptional()
  @IsEnum(['hacker', 'hipster', 'hustler'], {
    message: 'type must be one of: hacker, hipster, hustler',
  })
  type?: 'hacker' | 'hipster' | 'hustler';
}
