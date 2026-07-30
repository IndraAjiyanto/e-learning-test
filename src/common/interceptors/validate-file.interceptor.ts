import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ValidateFileInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      return next.handle();
    }

    const options = this.reflector.get('validateFile', context.getHandler());

    if (!options) {
      return next.handle();
    }

    const {
      maxSize,
      allowedTypes,
      fileExtensions,
      folder,
      resourceType = 'auto',
    } = options;

    try {
      // ========================================
      // VALIDASI 1: FILE SIZE
      // ========================================
      if (maxSize && file.size > maxSize) {
        throw new Error(
          `File size too large. Maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        );
      }

      // ========================================
      // VALIDASI 2: FILE TYPE (MIME TYPE)
      // ========================================
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        throw new Error(
          `File type ${file.mimetype} is not allowed. Only: ${allowedTypes.join(', ')}`,
        );
      }

      // ========================================
      // VALIDASI 3: FILE EXTENSION
      // ========================================
      if (fileExtensions) {
        const fileExt = `.${file.originalname.split('.').pop()}`;
        if (!fileExtensions.includes(fileExt.toLowerCase())) {
          throw new Error(
            `File extension ${fileExt} is not allowed. Only: ${fileExtensions.join(', ')}`,
          );
        }
      }

      // ========================================
      // SIMPAN FILE KE LOCAL STORAGE
      // ========================================

      if (file.path) {
        const relativePath = file.path
          .replace(process.cwd(), '')
          .replace(/\\/g, '/')
          .replace('/public', '');

        if (!request.body.uploadedFileUrls) {
          request.body.uploadedFileUrls = [];
        }
        request.body.uploadedFileUrls.push(relativePath);
      } else if (file.buffer) {
        const uploadDir = path.join(
          process.cwd(),
          'public',
          'asset',
          folder || 'uploads',
        );

        await fs.mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = path.extname(file.originalname);
        const filename = `${timestamp}-${randomString}${fileExtension}`;

        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, file.buffer);

        const fileUrl = `/asset/${folder || 'uploads'}/${filename}`;

        if (!request.body.uploadedFileUrls) {
          request.body.uploadedFileUrls = [];
        }
        request.body.uploadedFileUrls.push(fileUrl);

      } else {
        throw new Error('Invalid file: no buffer or path');
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
