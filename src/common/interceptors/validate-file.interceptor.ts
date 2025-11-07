import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v2 as cloudinary } from 'cloudinary';
import { Reflector } from '@nestjs/core';

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
      resourceType = 'auto', // Default 'auto', bisa diubah ke 'raw', 'image', 'video'
    } = options;

    // Validate file size
    if (maxSize && file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate file extension
    if (fileExtensions) {
      const fileExt = `.${file.originalname.split('.').pop()}`;
      if (!fileExtensions.includes(fileExt.toLowerCase())) {
        throw new BadRequestException(
          `File extension ${fileExt} is not allowed. Allowed extensions: ${fileExtensions.join(', ')}`,
        );
      }
    }

    try {
      // Upload to Cloudinary with specified resource_type
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadOptions: any = {
          folder: folder || 'uploads',
        };

        // Set resource_type based on file type or explicit option
        if (resourceType === 'raw' || file.mimetype === 'application/pdf') {
          uploadOptions.resource_type = 'raw';
        } else if (resourceType === 'image' || file.mimetype.startsWith('image/')) {
          uploadOptions.resource_type = 'image';
        } else if (resourceType === 'video' || file.mimetype.startsWith('video/')) {
          uploadOptions.resource_type = 'video';
        } else {
          uploadOptions.resource_type = 'auto';
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(file.buffer);
      });

      // Store uploaded file URL in request body
      if (!request.body.uploadedFileUrls) {
        request.body.uploadedFileUrls = [];
      }
      request.body.uploadedFileUrls.push(uploadResult.secure_url);

      console.log('File uploaded to Cloudinary:', uploadResult.secure_url);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new BadRequestException('Failed to upload file to cloud storage');
    }

    return next.handle();
  }
}