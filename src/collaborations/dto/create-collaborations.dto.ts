import { IsString } from 'class-validator';

export class CreateCollaborationsDto {
  @IsString()
  image: string;
}
