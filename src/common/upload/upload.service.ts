import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { imageSize } from 'image-size';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  async validateImageDimensions(
    file: Express.Multer.File,
    options: {
      minWidth: number;
      maxWidth: number;
      minHeight: number;
      maxHeight: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No image uploaded');
    }

    if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
      throw new BadRequestException('Only JPG, JPEG, or PNG files are allowed');
    }
    let width: number | undefined;
    let height: number | undefined;

    try {
      const dimensions = imageSize(file.buffer);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      // Menangkap error jika file korup atau bukan gambar asli
      throw new BadRequestException('Invalid or corrupted image file');
    }

    if (!width || !height) {
      throw new BadRequestException('Could not determine image dimensions');
    }

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
    skipTransformation = false,
  ): Promise<string> {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      timeout: 60000,
    };

    if (!skipTransformation) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
      ];
    }

    const startTime = Date.now();
    const result: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            resolve(result);
          }
        },
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });

    return result.secure_url;
  }
}
