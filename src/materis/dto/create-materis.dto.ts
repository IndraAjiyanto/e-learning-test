import { IsNumber, IsString } from "class-validator";

export class CreateMaterisDto {
    @IsString()
    pdf: string

    @IsString()
    video: string

    @IsString()
    ppt: string

    @IsNumber()
    kelasId: number
}
