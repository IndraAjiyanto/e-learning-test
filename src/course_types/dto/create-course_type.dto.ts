import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateCourseTypeDto {
  @IsString()
  nameClassesType: string;

  @IsString()
  @Matches(
    /^((fa-(solid|regular|brands|light|thin|duotone)|fas|far|fab)\s+fa-[a-z0-9]+(-[a-z0-9]+)*|fa-[a-z0-9]+(-[a-z0-9]+)*|[a-z0-9]+(-[a-z0-9]+)*)$/i,
    {
      message:
        'icon format is invalid or incomplete (e.g. "code", "fa-code", or "fa-solid fa-code")',
    },
  )
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
