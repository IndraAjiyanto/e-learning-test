import { IsArray, IsString } from 'class-validator';

export class CreateTeamLeadDto {
  @IsString()
  profile: string;

  @IsString()
  name: string;

  @IsArray()
  position: string[];

  @IsArray()
  description: string[];

  @IsString()
  instagram: string;

  @IsString()
  linkedin: string;
}
