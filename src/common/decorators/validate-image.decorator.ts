import { SetMetadata } from '@nestjs/common';

export const VALIDATE_IMAGE_KEY = 'validateImageOptions';

export interface ValidateImageOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  folder: string;
  maxSize?: number; // in bytes (e.g., 3 * 1024 * 1024 = 3MB)
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png', 'image/webp']
}

export const ValidateImage = (options: ValidateImageOptions) =>
  SetMetadata(VALIDATE_IMAGE_KEY, options);
