import { IsInt, IsString } from "class-validator";

export class CreateMentorDto {
    @IsString()
    nama: string

    @IsString()
    posisi: string

    @IsString()
    profile: string

    @IsString()
    deskripsi: string

    @IsInt()
    kelasId: number
}
