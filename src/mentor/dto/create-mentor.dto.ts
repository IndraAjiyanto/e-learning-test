import { IsInt, IsString } from "class-validator";

export class CreateMentorDto {
    @IsString()
    nama: string

    @IsString()
    posisi: string

    @IsString()
    profile: string

              @IsString()
          teknologi: string[]

    @IsString()
    linkedin: string

    @IsString()
    github: string

    @IsString()
    deskripsi: string

    @IsInt()
    kelasId: number
}
