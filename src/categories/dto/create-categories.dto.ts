import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  hero_section_image?: string;

  @IsArray()
  description: string[];

  @IsOptional()
  @IsArray()
  text?: string[];

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  courseType?: string[];

  @IsEnum(['Special Program', 'Paid Program', 'Free Program'])
  type: 'Special Program' | 'Paid Program' | 'Free Program';
}
