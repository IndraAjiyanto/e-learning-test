import { ValidateNested, IsArray, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class JawabanUserDto {
  @IsOptional()
  @IsUUID()
  jawabanId?: string | null;

  @IsUUID()
  pertanyaanId: string;

  @IsUUID()
  userId: string;
}

export class CreateJawabanUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JawabanUserDto)
  jawabanUser: JawabanUserDto[];
}
