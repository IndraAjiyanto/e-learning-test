import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateOurExperienceDto {
      @IsNotEmpty()
      @IsString()
      icon: string;
    
      @IsNotEmpty()
      @IsArray()
      title: string[];
    
      @IsNotEmpty()
      @IsArray()
      description: string[];
}
