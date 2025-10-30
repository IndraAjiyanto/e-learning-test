import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  VALIDATE_IMAGE_KEY,
  ValidateImageOptions,
} from '../decorators/validate-image.decorator';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ValidateImageInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private uploadService: UploadService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const options = this.reflector.get<ValidateImageOptions>(
      VALIDATE_IMAGE_KEY,
      context.getHandler(),
    );

    // kalau handler gak pakai @ValidateImage, langsung lanjut aja
    if (!options) return next.handle();

    // deteksi apakah pakai FileInterceptor atau FilesInterceptor atau FileFieldsInterceptor
    const files: Express.Multer.File[] = [];

    if (Array.isArray(request.files)) {
      // FilesInterceptor - banyak file dengan nama sama
      files.push(...(request.files as Express.Multer.File[]));
    } else if (typeof request.files === 'object' && request.files !== null) {
      // FileFieldsInterceptor - banyak file dengan nama beda
      Object.values(
        request.files as { [fieldname: string]: Express.Multer.File[] },
      ).forEach((fileArray) => {
        files.push(...fileArray);
      });
    } else if (request.file) {
      // FileInterceptor - satu file
      files.push(request.file as Express.Multer.File);
    }

    // kalau gak ada file, skip
    if (!files.length) return next.handle();

    try {
      const uploadResults: string[] = [];

      for (const file of files) {
        // Validasi file size
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(
            `File size exceeds maximum allowed size of ${(options.maxSize / 1024 / 1024).toFixed(2)}MB`,
          );
        }

        // Validasi file type
        if (
          options.allowedTypes &&
          !options.allowedTypes.includes(file.mimetype)
        ) {
          throw new Error(
            `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
          );
        }

        // Validasi dimensi gambar (hanya jika semua options dimensi ada)
        if (
          options.minWidth &&
          options.maxWidth &&
          options.minHeight &&
          options.maxHeight
        ) {
          await this.uploadService.validateImageDimensions(file, {
            minWidth: options.minWidth,
            maxWidth: options.maxWidth,
            minHeight: options.minHeight,
            maxHeight: options.maxHeight,
          });
        }

        const imageUrl = await this.uploadService.uploadToCloudinary(
          file,
          options.folder,
        );
        uploadResults.push(imageUrl);
      }

      // taruh hasil upload di body agar bisa diakses di controller
      request.body.uploadedImageUrls = uploadResults;
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
