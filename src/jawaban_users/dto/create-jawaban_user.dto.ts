import { ValidateNested, IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class JawabanUserDto {
  @IsOptional()
  @IsInt()
  jawabanId?: number | null;

  @IsInt()
  pertanyaanId: number;

  @IsInt()
  userId: number;
}

export class CreateJawabanUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JawabanUserDto)
  jawabanUser: JawabanUserDto[];
}
