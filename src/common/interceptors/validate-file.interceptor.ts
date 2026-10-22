import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ValidateFileOptions {
  maxSize?: number;
  allowedTypes?: string[];
  fileExtensions?: string[];
  folder?: string;
  resourceType?: string;
}

interface RequestWithCustomBody extends Request {
  file?: Express.Multer.File;
  body: {
    uploadedFileUrls?: string[];
    [key: string]: unknown;
  };
}

@Injectable()
export class ValidateFileInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithCustomBody>();
    const file = request.file;

    if (!file) {
      return next.handle();
    }

    const options = this.reflector.get<ValidateFileOptions>(
      'validateFile',
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const { maxSize, allowedTypes, fileExtensions, folder } = options;

    try {
      if (maxSize && file.size > maxSize) {
        throw new Error(
          `File size too large. Maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        );
      }

      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        throw new Error(
          `File type ${file.mimetype} is not allowed. Only: ${allowedTypes.join(', ')}`,
        );
      }

      if (fileExtensions) {
        const fileExt = `.${file.originalname.split('.').pop() || ''}`;
        if (!fileExtensions.includes(fileExt.toLowerCase())) {
          throw new Error(
            `File extension ${fileExt} is not allowed. Only: ${fileExtensions.join(', ')}`,
          );
        }
      }

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
    } catch (err: unknown) {
      const error = err as Error;
      throw new BadRequestException(error.message);
    }

    return next.handle();
  }
}
