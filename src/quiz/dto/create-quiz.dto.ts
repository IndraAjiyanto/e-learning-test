import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'Quiz name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  quizName: string;

  @Type(() => Number)
  @IsInt({ message: 'Minimum score must be an integer' })
  @Min(0, { message: 'Minimum score cannot be negative' })
  minScore: number;

  @IsOptional()
  @IsUUID()
  weeksId?: string;

  @IsOptional()
  @IsUUID()
  syllabusId?: string;

  @Type(() => Number)
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;
}
