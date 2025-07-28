import { IsEnum, IsOptional, IsString, IsArray, IsDateString, IsNumber } from "class-validator";
import { Status } from "src/entities/absen.entity";

export class CreateAbsenDto {
    @IsEnum(Status, { each: true }) 
    @IsArray()
    @IsOptional()
    status?: Status[] = [Status.TidakAdaKeterangan];

    @IsDateString()
    @IsOptional()
    waktu_absen?: Date;

    @IsString()
    @IsOptional()
    Keterangan?: string;

    @IsNumber()
    @IsOptional()
    userId?: number;

    @IsNumber()
    @IsOptional()
    pertemuanId?: number;
}