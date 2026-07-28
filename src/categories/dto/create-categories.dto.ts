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
  for?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseType?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  infoId?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  infoEn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  infoJa?: string[];

  @IsEnum(['Special Program', 'Paid Program', 'Free Program'])
  type: 'Special Program' | 'Paid Program' | 'Free Program';
}
