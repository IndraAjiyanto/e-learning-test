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
import * as fs from 'fs/promises';
import * as path from 'path';

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

    if (!options) return next.handle();

    const files: Express.Multer.File[] = [];

    if (Array.isArray(request.files)) {
      files.push(...request.files);
    } else if (typeof request.files === 'object' && request.files !== null) {
      Object.values(
        request.files as { [fieldname: string]: Express.Multer.File[] },
      ).forEach((fileArray) => {
        files.push(...fileArray);
      });
    } else if (request.file) {
      files.push(request.file);
    }


    const validFiles = files.filter((file) => file.size > 0);

    if (!validFiles.length) {
      request.file = undefined;
      request.files = undefined;
      return next.handle();
    }

    try {
      const uploadResults: string[] = [];

      for (const file of files) {
        // ========================================
        // VALIDASI 1: FILE SIZE
        // ========================================
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(
            `Ukuran file terlalu besar. Maksimal ${(options.maxSize / 1024 / 1024).toFixed(2)}MB`,
          );
        }

        // ========================================
        // VALIDASI 2: FILE TYPE (MIME TYPE)
        // ========================================
        if (
          options.allowedTypes &&
          !options.allowedTypes.includes(file.mimetype)
        ) {
          throw new Error(
            `Tipe file tidak diizinkan. Hanya: ${options.allowedTypes.join(', ')}`,
          );
        }

        // ========================================
        // VALIDASI 3: IMAGE DIMENSIONS
        // ========================================
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

        // ========================================
        // SIMPAN FILE (SETELAH SEMUA VALIDASI LOLOS)
        // ========================================

        if (file.path) {
          const relativePath = file.path
            .replace(process.cwd(), '')
            .replace(/\\/g, '/')
            .replace('/public', '');
          uploadResults.push(relativePath);
        } else if (file.buffer) {
          const uploadDir = path.join(
            process.cwd(),
            'public',
            'asset',
            options.folder || 'images',
          );

          await fs.mkdir(uploadDir, { recursive: true });

          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExtension = path.extname(file.originalname);
          const filename = `${timestamp}-${randomString}${fileExtension}`;

          const filePath = path.join(uploadDir, filename);

          await fs.writeFile(filePath, file.buffer);

          const fileUrl = `/asset/${options.folder || 'images'}/${filename}`;
          uploadResults.push(fileUrl);
        } else {
          throw new Error('File tidak valid: tidak ada buffer atau path');
        }
      }

      request.body.uploadedImageUrls = uploadResults;
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
