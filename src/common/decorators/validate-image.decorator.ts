import { SetMetadata } from '@nestjs/common';

export const VALIDATE_IMAGE_KEY = 'validateImageOptions';

export interface ValidateImageOptions {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  folder: string;
}

export const ValidateImage = (options: ValidateImageOptions) =>
  SetMetadata(VALIDATE_IMAGE_KEY, options);
