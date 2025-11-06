import { SetMetadata } from '@nestjs/common';

export const VALIDATE_FILE_KEY = 'validateFileOptions';

export interface ValidateFileOptions {
  folder: string;
  maxSize?: number; // in bytes (e.g., 50 * 1024 * 1024 = 50MB)
  allowedTypes?: string[]; // e.g., ['application/pdf', 'video/mp4']
  fileExtensions?: string[]; // e.g., ['.pdf', '.ppt', '.pptx']
}

export const ValidateFile = (options: ValidateFileOptions) =>
  SetMetadata(VALIDATE_FILE_KEY, options);
