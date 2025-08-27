import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Proses } from "src/entities/pembayaran.entity";

export class CreatePembayaranDto {
      @IsString()
      file: string
    
      @IsEnum(['acc' , 'proces' , 'rejected'])
    @IsOptional()
      proses: Proses;
    
        @IsNumber()
        userId: number

        @IsNumber()
        kelasId: number
}
