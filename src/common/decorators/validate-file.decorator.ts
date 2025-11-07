import { SetMetadata } from '@nestjs/common';

export interface ValidateFileOptions {
  maxSize?: number;
  allowedTypes?: string[];
  fileExtensions?: string[];
  folder?: string;
  resourceType?: 'auto' | 'image' | 'raw' | 'video'; // Tambahkan resourceType
}

export const ValidateFile = (options: ValidateFileOptions) =>
  SetMetadata('validateFile', options);