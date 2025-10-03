import { IsInt, IsString } from "class-validator";

export class CreateBenefitKelaDto {
    @IsString()
    benefit: string

    @IsString()
    icon: string

    @IsString()
    isi: string

    @IsInt()
    kategoriId: number
}