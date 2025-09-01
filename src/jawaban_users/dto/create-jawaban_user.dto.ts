import { ValidateNested, IsArray, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class JawabanUserDto {
    @IsInt()
    jawabanId: number

    @IsInt()
    pertanyaanId: number

    @IsInt()
    userId: number
}

export class CreateJawabanUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JawabanUserDto)
  jawabanUser: JawabanUserDto[];
}
    