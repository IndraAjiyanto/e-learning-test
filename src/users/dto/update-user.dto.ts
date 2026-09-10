import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * Status verifikasi akun (kolom `isVerified` pada entity User).
   * Dikirim dari form Edit User (Super Admin) sebagai string 'true' | 'false'
   * karena form-nya multipart, sehingga perlu di-coerce ke boolean.
   *
   * Catatan: project ini belum memasang global ValidationPipe, jadi @Transform
   * di bawah TIDAK otomatis berjalan. Coercion yang sebenarnya dipakai ada di
   * UsersController.updateAdmin(). Decorator di sini menyusul aktif begitu
   * ValidationPipe({ transform: true }) dipasang.
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isVerified?: boolean;
}
