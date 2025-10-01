import { IsString } from "class-validator";

export class CreateBenefitDto {
    @IsString()
    judul: string

    @IsString()
    text: string
}
