import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from 'src/entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  confirm_password: string;

  @IsString()
  @IsOptional()
  verificationToken: string;

  @IsDate()
  @IsOptional()
  verificationTokenExpires: Date;

  @IsString()
  profile: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  courseId?: string[];

  @IsEnum(['super_admin', 'admin', 'user'])
  @IsOptional()
  role?: UserRole;
}
