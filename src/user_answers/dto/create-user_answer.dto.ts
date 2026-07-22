import { ValidateNested, IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserAnswerDto {
  @IsOptional()
  @IsInt()
  answersId?: number | null;

  @IsInt()
  questionsId: number;

  @IsInt()
  userId: number;
}

export class CreateUserAnswerDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerDto)
  answerUser: UserAnswerDto[];
}
