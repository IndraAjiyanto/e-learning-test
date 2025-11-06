import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  VALIDATE_FILE_ONLY_KEY,
  ValidateFileOnlyOptions,
} from '../decorators/validate-file-only.decorator';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ValidateFileOnlyInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const options = this.reflector.get<ValidateFileOnlyOptions>(
      VALIDATE_FILE_ONLY_KEY,
      context.getHandler(),
    );

    // kalau handler gak pakai @ValidateFileOnly, langsung lanjut aja
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
      for (const file of files) {
        // Validasi file size
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(
            `File size exceeds maximum allowed size of ${(options.maxSize / 1024 / 1024).toFixed(2)}MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          );
        }

        // Validasi file type (MIME type)
        if (
          options.allowedTypes &&
          !options.allowedTypes.includes(file.mimetype)
        ) {
          throw new Error(
            `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
          );
        }

        // Validasi file extension
        if (options.fileExtensions) {
          const fileExt = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
          if (!options.fileExtensions.includes(fileExt)) {
            throw new Error(
              `File extension ${fileExt} is not allowed. Allowed extensions: ${options.fileExtensions.join(', ')}`,
            );
          }
        }
      }

      // TIDAK UPLOAD KE CLOUDINARY - hanya validasi saja
      // File akan diproses di controller
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
