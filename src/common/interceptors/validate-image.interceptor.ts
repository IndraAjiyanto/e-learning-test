import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VALIDATE_IMAGE_KEY, ValidateImageOptions } from '../decorators/validate-image.decorator';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ValidateImageInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private uploadService: UploadService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const file = request.file;
    const options = this.reflector.get<ValidateImageOptions>(
      VALIDATE_IMAGE_KEY,
      context.getHandler(),
    );

    // kalau nggak ada @ValidateImage di handler, skip aja
    if (!options || !file) return next.handle();

    try {
      await this.uploadService.validateImageDimensions(file, options);

      // upload ke cloudinary
      const imageUrl = await this.uploadService.uploadToCloudinary(file, options.folder);
      request.body.uploadedImageUrl = imageUrl;
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return next.handle();
  }
}
