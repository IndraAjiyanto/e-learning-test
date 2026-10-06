import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
