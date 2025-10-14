import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { imageSize } from 'image-size';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  async validateImageDimensions(
    file: Express.Multer.File,
    options: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number },
  ) {
    if (!file) throw new BadRequestException('No image uploaded');

    if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
      throw new BadRequestException('Only JPG, JPEG, or PNG files are allowed');
    }

    const { width, height } = imageSize(file.buffer);
    if (!width || !height) throw new BadRequestException('Invalid image dimensions');

    if (
      width < options.minWidth ||
      width > options.maxWidth ||
      height < options.minHeight ||
      height > options.maxHeight
    ) {
      throw new BadRequestException(
        `Image dimensions must be between ${options.minWidth}–${options.maxWidth}px (width) and ${options.minHeight}–${options.maxHeight}px (height)`,
      );
    }
  }

  async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const result: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });

    return result.secure_url;
  }
}
