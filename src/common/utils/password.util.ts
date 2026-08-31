import { BadRequestException } from '@nestjs/common';

/**
 * Memvalidasi kekuatan password sesuai kriteria pendaftaran & reset password:
 * minimal 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, 1 karakter khusus.
 * Melempar BadRequestException berisi semua kriteria yang belum terpenuhi.
 */
export function validatePasswordStrength(password: string) {
  const value = typeof password === 'string' ? password : '';

  const rules: { valid: boolean; message: string }[] = [
    {
      valid: value.length >= 8,
      message: 'Password must be at least 8 characters',
    },
    {
      valid: /[A-Z]/.test(value),
      message: 'Password must contain at least 1 uppercase letter',
    },
    {
      valid: /[a-z]/.test(value),
      message: 'Password must contain at least 1 lowercase letter',
    },
    {
      valid: /[0-9]/.test(value),
      message: 'Password must contain at least 1 number',
    },
    {
      valid: /[^A-Za-z0-9]/.test(value),
      message: 'Password must contain at least 1 special character',
    },
  ];

  const failed = rules.filter((rule) => !rule.valid);
  if (failed.length > 0) {
    throw new BadRequestException(failed.map((rule) => rule.message).join(', '));
  }
}
