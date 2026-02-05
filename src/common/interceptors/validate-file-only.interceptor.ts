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

    if (!files.length) return next.handle();

    try {
      for (const file of files) {
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(
            `File size exceeds maximum allowed size of ${(options.maxSize / 1024 / 1024).toFixed(2)}MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          );
        }

        if (
          options.allowedTypes &&
          !options.allowedTypes.includes(file.mimetype)
        ) {
          throw new Error(
            `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
          );
        }

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

    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
