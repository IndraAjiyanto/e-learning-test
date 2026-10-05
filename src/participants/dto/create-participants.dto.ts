import { IsArray, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateParticipantsDto {
  @IsArray()
  title: string[];

  @IsString()
  icon: string;

  @IsArray()
  description: string[];

  @IsUUID()
  courseId: string;
}
