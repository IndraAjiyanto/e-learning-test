import { Module } from '@nestjs/common';
import { ValidateImageInterceptor } from './interceptors/validate-image.interceptor';
import { ValidateFileInterceptor } from './interceptors/validate-file.interceptor';
import { ValidateFileOnlyInterceptor } from './interceptors/validate-file-only.interceptor';
import { UploadService } from './upload/upload.service';

@Module({
  providers: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
  ],
  exports: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
  ],
})
export class CommonModule {}
