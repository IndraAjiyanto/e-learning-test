// 3. Multer Config yang diperbaiki
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Options as MulterOptions } from 'multer';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Untuk PPT, kita gunakan memory storage karena perlu convert dulu
export const multerConfigPpt: MulterOptions = {
  storage: new (require('multer')).memoryStorage(), // Gunakan memory storage
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validasi file type
    const allowedMimeTypes = [
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ];

    const allowedExtensions = ['.ppt', '.pptx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};

// Config lainnya tetap sama
export const multerConfigImage: MulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'nestjs/images/profile',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: (req, file) =>
        `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    } as any,
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

export const multerConfigPayment: MulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'nestjs/images/payment',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: (req, file) =>
        `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    } as any,
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

export const multerConfigVideo: MulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'nestjs/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'avi', 'mov'],
      public_id: (req, file) =>
        `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    } as any,
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
};

export const multerConfigPdf: MulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'nestjs/pdf',
      resource_type: 'raw',
      allowed_formats: ['pdf'],
      public_id: (req, file) =>
        `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    } as any,
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
};