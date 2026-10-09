import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidateImageInterceptor } from './interceptors/validate-image.interceptor';
import { ValidateFileInterceptor } from './interceptors/validate-file.interceptor';
import { ValidateFileOnlyInterceptor } from './interceptors/validate-file-only.interceptor';
import { UploadService } from './upload/upload.service';
import { OrphanImageCleanupService } from './cleanup/orphan-image-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
    OrphanImageCleanupService,
  ],
  exports: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
  ],
})
export class CommonModule {}
