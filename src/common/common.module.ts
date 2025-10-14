import { Module } from '@nestjs/common';
import { ValidateImageInterceptor } from './interceptors/validate-image.interceptor';
import { UploadService } from './upload/upload.service';

@Module({
  providers: [UploadService, ValidateImageInterceptor],
  exports: [UploadService, ValidateImageInterceptor],
})
export class CommonModule {}
