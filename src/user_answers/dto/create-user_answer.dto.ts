import { IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserAnswerDto {
  @IsOptional()
  @IsInt()
  answersId?: string | null;

  @IsUUID()
  questionsId: string;

  @IsUUID()
  userId: string;
}

export class CreateUserAnswerDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerDto)
  answerUser: UserAnswerDto[];
}
