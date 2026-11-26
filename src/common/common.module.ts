import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateImageInterceptor } from './interceptors/validate-image.interceptor';
import { ValidateFileInterceptor } from './interceptors/validate-file.interceptor';
import { ValidateFileOnlyInterceptor } from './interceptors/validate-file-only.interceptor';
import { UploadService } from './upload/upload.service';
import { OrphanImageCleanupService } from './cleanup/orphan-image-cleanup.service';
import { NotificationService } from './notification/notification.service';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([User])],
  providers: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
    OrphanImageCleanupService,
    NotificationService,
  ],
  exports: [
    UploadService,
    ValidateImageInterceptor,
    ValidateFileInterceptor,
    ValidateFileOnlyInterceptor,
    NotificationService,
  ],
})
export class CommonModule {}
