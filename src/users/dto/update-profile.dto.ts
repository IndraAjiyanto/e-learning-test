import { IsString } from "class-validator";

export class UpdateProfileDto{
    @IsString()
    profile: string
}