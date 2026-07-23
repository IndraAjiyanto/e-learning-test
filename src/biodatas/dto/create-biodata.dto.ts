import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Gender, Education } from 'src/entities/biodata.entity';

export class CreateBiodataDto {
  @IsString()
  full_name: string;

  @IsString()
  no: string;

  @IsEnum(['Laki laki', 'Perempuan'])
  @IsOptional()
  gender: Gender;

  @IsString()
  city: string;

  @IsEnum([
    'SMP/Sederajat',
    'SMA/SMK/Sederajat',
    'Diploma(D3/D4)',
    'Sarjana(S1)',
  ])
  @IsOptional()
  education: Education;

  @IsString()
  study_program: string;

  @IsInt()
  userId: number;
}
