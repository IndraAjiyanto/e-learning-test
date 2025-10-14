import { IsString } from "class-validator";

export class CreateTeamDto {
    @IsString()
    profile: string

    @IsString()
    nama: string

    @IsString()
    posisi: string

    @IsString()
    linkedin: string
    
}
