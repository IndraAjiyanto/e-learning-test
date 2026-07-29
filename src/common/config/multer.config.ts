import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { memoryStorage, diskStorage, Options as MulterOptions } from 'multer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// ============================================
// FLEXIBLE MULTER CONFIG FACTORY
// ============================================

interface FileTypeConfig {
  mimeTypes: string[];
  extensions: string[];
  errorMessage: string;
}

const FILE_TYPES: Record<string, FileTypeConfig> = {
  image: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    errorMessage:
      'Invalid file format. Only image files (JPG, JPEG, PNG) are allowed',
  },
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    errorMessage: 'Invalid file format. Only PDF files are allowed',
  },
  video: {
    mimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'],
    extensions: ['.mp4', '.avi', '.mov'],
    errorMessage:
      'Invalid file format. Only video files (MP4, AVI, MOV) are allowed',
  },
  ppt: {
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    extensions: ['.ppt', '.pptx'],
    errorMessage:
      'Invalid file format. Only PowerPoint files (PPT, PPTX) are allowed',
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    errorMessage:
      'Invalid file format. Only document files (PDF, DOC, DOCX, XLS, XLSX) are allowed',
  },
  any: {
    mimeTypes: [],
    extensions: [],
    errorMessage: 'Invalid file format',
  },
};

interface CreateMemoryConfigOptions {
  fileTypes: (keyof typeof FILE_TYPES)[];
  maxSize?: number; // in MB
  customErrorMessage?: string;
}

/**
 * Factory function untuk membuat memory storage config yang fleksibel
 */
export const createMemoryConfig = (
  options: CreateMemoryConfigOptions,
): MulterOptions => {
  const { fileTypes, maxSize = 5, customErrorMessage } = options;

  const allowedMimeTypes: string[] = [];
  const allowedExtensions: string[] = [];
  let errorMessage = customErrorMessage;

  fileTypes.forEach((type) => {
    const config = FILE_TYPES[type];
    allowedMimeTypes.push(...config.mimeTypes);
    allowedExtensions.push(...config.extensions);
    if (!errorMessage) {
      errorMessage = config.errorMessage;
    }
  });

  return {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf('.'));

      if (fileTypes.includes('any')) {
        callback(null, true);
        return;
      }

      const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      if (isValidMimeType && isValidExtension) {
        callback(null, true);
      } else {
        callback(
          new Error(errorMessage || 'Invalid file format') as any,
          false,
        );
      }
    },
    limits: {
      fileSize: maxSize * 1024 * 1024,
    },
  };
};

// ============================================
// LOCAL DISK STORAGE CONFIG (BARU!)
// ============================================

interface CreateLocalConfigOptions {
  folder: string; // folder tujuan, misal: 'alumni', 'payment', 'documents'
  fileTypes: (keyof typeof FILE_TYPES)[];
  maxSize?: number; // in MB
  customErrorMessage?: string;
}

/**
 * Factory function untuk membuat local disk storage config
 * @param options - Konfigurasi untuk menyimpan file ke local disk
 * @returns MulterOptions untuk local disk storage
 *
 * @example
 * // Simpan gambar ke local
 * createLocalConfig({
 *   folder: 'alumni',
 *   fileTypes: ['image']
 * })
 * // File akan disimpan di: public/uploads/alumni/
 */
export const createLocalConfig = (
  options: CreateLocalConfigOptions,
): MulterOptions => {
  const { folder, fileTypes, maxSize = 10, customErrorMessage } = options;

  const allowedMimeTypes: string[] = [];
  const allowedExtensions: string[] = [];
  let errorMessage = customErrorMessage;

  fileTypes.forEach((type) => {
    const config = FILE_TYPES[type];
    allowedMimeTypes.push(...config.mimeTypes);
    allowedExtensions.push(...config.extensions);
    if (!errorMessage) {
      errorMessage = config.errorMessage;
    }
  });

  // Path ke folder upload
  const uploadPath = path.join(process.cwd(), 'public', 'uploads', folder);

  // Buat folder jika belum ada
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = path.extname(file.originalname);
        const filename = `${timestamp}-${randomString}${fileExtension}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf('.'));

      if (fileTypes.includes('any')) {
        callback(null, true);
        return;
      }

      const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      if (isValidMimeType && isValidExtension) {
        callback(null, true);
      } else {
        callback(
          new Error(errorMessage || 'Invalid file format') as any,
          false,
        );
      }
    },
    limits: {
      fileSize: maxSize * 1024 * 1024,
    },
  };
};

interface CreateCloudinaryConfigOptions {
  folder: string;
  fileTypes: (keyof typeof FILE_TYPES)[];
  maxSize?: number;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  customErrorMessage?: string;
}

export const createCloudinaryConfig = (
  options: CreateCloudinaryConfigOptions,
): MulterOptions => {
  const {
    folder,
    fileTypes,
    maxSize = 5,
    resourceType = 'auto',
    transformation = [],
    customErrorMessage,
  } = options;

  const allowedFormats: string[] = [];
  fileTypes.forEach((type) => {
    const config = FILE_TYPES[type];
    config.extensions.forEach((ext) => {
      allowedFormats.push(ext.replace('.', ''));
    });
  });

  return {
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder,
        resource_type: resourceType,
        allowed_formats: allowedFormats,
        transformation,
        public_id: (req, file) =>
          `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      } as any,
    }),
    limits: {
      fileSize: maxSize * 1024 * 1024,
    },
  };
};

// ============================================
// PREDEFINED CONFIGS
// ============================================

export const multerConfigMemory = createMemoryConfig({
  fileTypes: ['image'],
});

// export const multerConfigLocalPayment = createLocalConfig({
//   folder: 'payment',
//   fileTypes: ['image'],
// });

// export const multerConfigLocalVideo = createLocalConfig({
//   folder: 'videos',
//   fileTypes: ['video'],
//   maxSize: 100,
// });

// export const multerConfigLocalPdf = createLocalConfig({
//   folder: 'documents',
//   fileTypes: ['pdf'],
//   maxSize: 20,
// });

// export const multerConfigLocalPpt = createLocalConfig({
//   folder: 'presentations',
//   fileTypes: ['ppt'],
//   maxSize: 50,
// });

// CLOUDINARY CONFIGS (untuk yang masih pakai Cloudinary)
export const multerConfigImage = createCloudinaryConfig({
  folder: 'nestjs/images/profile',
  fileTypes: ['image'],
  resourceType: 'image',
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
});

export const multerConfigPayment = createCloudinaryConfig({
  folder: 'nestjs/images/payment',
  fileTypes: ['image'],
  resourceType: 'image',
});

export const multerConfigVideo = createCloudinaryConfig({
  folder: 'nestjs/videos',
  fileTypes: ['video'],
  resourceType: 'video',
  maxSize: 100,
});

export const multerConfigPdf = createCloudinaryConfig({
  folder: 'nestjs/pdf',
  fileTypes: ['pdf'],
  resourceType: 'raw',
  maxSize: 20,
});

export const multerConfigMemoryOnly = {
  storage: memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB - batas kasar, validasi detail di interceptor
  },
};
