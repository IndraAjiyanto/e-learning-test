import { IsNumber, IsString } from "class-validator";

export class CreatePortfolioDto {
    @IsString()
    sertif: string
    
        @IsNumber()
        userId: number;
    
        @IsNumber()
        kelasId: number;
}
