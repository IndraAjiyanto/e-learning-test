import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';

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
  @IsNumber({}, { each: true })
  courseType?: number[];

  @IsEnum(['Special Program', 'Paid Program', 'Free Program'])
  type: 'Special Program' | 'Paid Program' | 'Free Program';
}
