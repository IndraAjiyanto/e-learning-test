import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFinalAssignmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  content?: string | object | null;
}

