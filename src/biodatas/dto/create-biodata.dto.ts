import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { JenisKelamin, Pendidikan } from "src/entities/biodata.entity";

export class CreateBiodataDto {
        @IsString()
        nama_lengkap: string
    
        @IsString()
        no: string
    
        @IsEnum(['Laki laki', 'Perempuan'])
        @IsOptional()
        jenis_kelamin: JenisKelamin

        @IsString()
        kota: string

        @IsEnum(['SMP/Sederajat', 'SMA/SMK/Sederajat', 'Diploma(D3/D4)', 'Sarjana(S1)'])
        @IsOptional()
        pendidikan: Pendidikan

        @IsString()
        program_studi: string
        
        @IsInt()
        userId: number
}
