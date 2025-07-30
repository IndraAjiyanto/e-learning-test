import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/entities/user.entity";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['super_admin', 'admin', 'user'])
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;
}
