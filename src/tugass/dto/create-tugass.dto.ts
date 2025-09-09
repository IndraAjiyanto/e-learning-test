import { IsNumber, IsString } from "class-validator";

export class CreateTugassDto {
        @IsString()
        file: string
        @IsString()
        judul: string
    @IsNumber()
    nilai: number
        @IsNumber()
        pertemuanId: number
}
