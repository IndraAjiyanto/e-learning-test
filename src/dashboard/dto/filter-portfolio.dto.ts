import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class FilterPortfolioDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  kategori?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  jenis_kelas?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;
}