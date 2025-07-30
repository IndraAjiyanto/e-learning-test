import { IsEnum, IsOptional, IsString, IsArray, IsDateString, IsNumber } from "class-validator";
import { Status } from "src/entities/absen.entity";

export class CreateAbsenDto {
    @IsEnum(Status, { each: true }) 
    @IsArray()
    status: Status[] = [Status.TidakAdaKeterangan];

    @IsDateString()
    waktu_absen: Date;

    @IsString()
    Keterangan: string;

    @IsNumber()
    userId: number;

    @IsNumber()
    pertemuanId: number;
}