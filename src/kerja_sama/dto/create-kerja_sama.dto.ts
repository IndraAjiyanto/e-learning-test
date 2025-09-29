import { IsString } from "class-validator";

export class CreateKerjaSamaDto {
    @IsString()
    gambar: string
}
