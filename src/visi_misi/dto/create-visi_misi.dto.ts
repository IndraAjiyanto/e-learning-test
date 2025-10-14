import { IsString } from "class-validator";

export class CreateVisiMisiDto {
    @IsString()
    visi: string;
    @IsString()
    misi: string;
}
