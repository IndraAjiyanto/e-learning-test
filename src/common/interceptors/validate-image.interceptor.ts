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

    // deteksi apakah pakai FileInterceptor atau FilesInterceptor
    const files: Express.Multer.File[] = [];

    if (Array.isArray(request.files)) {
      // banyak file
      files.push(...(request.files as Express.Multer.File[]));
    } else if (request.file) {
      // satu file
      files.push(request.file as Express.Multer.File);
    }

    // kalau gak ada file, skip
    if (!files.length) return next.handle();

    try {
      const uploadResults: string[] = [];

      for (const file of files) {
        await this.uploadService.validateImageDimensions(file, options);
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
