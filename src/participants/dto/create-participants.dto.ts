import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateParticipantsDto {
  @IsArray()
  title: string[];

  @IsString()
  icon: string;

  @IsArray()
  description: string[];

  @IsInt()
  courseId: number;
}
