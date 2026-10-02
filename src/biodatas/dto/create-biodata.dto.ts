import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender, Education } from 'src/entities/biodata.entity';

export class CreateBiodataDto {
  @IsString()
  fullName: string;

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
  studyProgram: string;

  @IsUUID()
  userId: string;
}
