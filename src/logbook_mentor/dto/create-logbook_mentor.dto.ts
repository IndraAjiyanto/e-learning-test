import { IsInt, IsString } from "class-validator";

export class CreateLogbookMentorDto {
     @IsString()
        kegiatan: string;
    
        @IsString()
        rincian_kegiatan: string;
    
        @IsString()
        dokumentasi: string;
    
        @IsString()
        kendala: string;
    
        @IsInt()
        userId: number;
    
        @IsInt()
        pertemuanId: number;
}
