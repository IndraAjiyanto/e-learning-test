import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateGalleryDto {

    @IsOptional()
    @IsString()
    file_path?: string

     @IsString()
    title:string

    @IsOptional()
     @IsString()
    description: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;
}
