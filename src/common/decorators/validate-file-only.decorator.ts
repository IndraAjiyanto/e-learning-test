import { SetMetadata } from '@nestjs/common';

export const VALIDATE_FILE_ONLY_KEY = 'validateFileOnlyOptions';

export interface ValidateFileOnlyOptions {
  maxSize?: number; // in bytes (e.g., 50 * 1024 * 1024 = 50MB)
  allowedTypes?: string[]; // e.g., ['application/pdf', 'video/mp4']
  fileExtensions?: string[]; // e.g., ['.pdf', '.ppt', '.pptx']
}

export const ValidateFileOnly = (options: ValidateFileOnlyOptions) =>
  SetMetadata(VALIDATE_FILE_ONLY_KEY, options);
