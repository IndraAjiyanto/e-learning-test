import { ValidateNested, IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class JawabanUserDto {
  @IsOptional()
  @IsInt()
  answersId?: number | null;

  @IsInt()
  questionsId: number;

  @IsInt()
  userId: number;
}

export class CreateJawabanUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JawabanUserDto)
  answerUser: JawabanUserDto[];
}
