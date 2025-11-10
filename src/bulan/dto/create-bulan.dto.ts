import { IsNumber } from "class-validator";

export class CreateBulanDto {
    @IsNumber()
    bulan: number;
}