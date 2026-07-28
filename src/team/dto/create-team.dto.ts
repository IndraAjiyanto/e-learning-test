import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  profile: string;

  @IsString()
  name: string;

  @IsArray()
  position: string[];

  @IsNumber()
  teamOrder: number;

  @IsString()
  linkedin: string;

  @IsString()
  @IsOptional()
  instagram: string;

  @IsArray()
  @IsOptional()
  description: string[];
}
