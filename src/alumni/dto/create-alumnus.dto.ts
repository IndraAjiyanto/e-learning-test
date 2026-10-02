import { IsArray, IsEnum, IsString, IsUUID } from 'class-validator';
import { ALUMNI_RATINGS, AlumniRating } from 'src/entities/types/alumni-rating';

export class CreateAlumnusDto {
  @IsString()
  profile: string;

  @IsArray()
  name: string[];

  @IsArray()
  message: string[];

  @IsArray()
  currentPosition: string[];

  @IsEnum(ALUMNI_RATINGS)
  rating: AlumniRating;

  @IsUUID()
  courseId: string;
}
