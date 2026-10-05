import { BadRequestException } from '@nestjs/common';

const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL_CHAR = /[^A-Za-z0-9]/;

export function assertStrongPassword(password: string): void {
  const errors: string[] = [];

  if (!password || password.length < MIN_LENGTH) {
    errors.push(`at least ${MIN_LENGTH} characters`);
  }
  if (!HAS_UPPERCASE.test(password)) {
    errors.push('1 uppercase letter');
  }
  if (!HAS_LOWERCASE.test(password)) {
    errors.push('1 lowercase letter');
  }
  if (!HAS_NUMBER.test(password)) {
    errors.push('1 number');
  }
  if (!HAS_SPECIAL_CHAR.test(password)) {
    errors.push('1 special character');
  }

  if (errors.length > 0) {
    throw new BadRequestException(`Password must contain ${errors.join(', ')}`);
  }
}
