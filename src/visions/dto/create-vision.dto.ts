import { IsArray, IsString } from 'class-validator';

export class CreateVisionsDto {
  @IsArray()
  visions: string[];
}
