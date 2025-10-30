import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { memoryStorage, Options as MulterOptions } from 'multer';
import * as dotenv from 'dotenv';

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
    errorMessage: 'Format file tidak valid. Hanya file gambar (JPG, JPEG, PNG) yang diperbolehkan'
  },
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    errorMessage: 'Format file tidak valid. Hanya file PDF yang diperbolehkan'
  },
  video: {
    mimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'],
    extensions: ['.mp4', '.avi', '.mov'],
    errorMessage: 'Format file tidak valid. Hanya file video (MP4, AVI, MOV) yang diperbolehkan'
  },
  ppt: {
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: ['.ppt', '.pptx'],
    errorMessage: 'Format file tidak valid. Hanya file PowerPoint (PPT, PPTX) yang diperbolehkan'
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    errorMessage: 'Format file tidak valid. Hanya file dokumen (PDF, DOC, DOCX, XLS, XLSX) yang diperbolehkan'
  },
  any: {
    mimeTypes: [],
    extensions: [],
    errorMessage: 'Format file tidak valid'
  }
};

interface CreateMemoryConfigOptions {
  fileTypes: (keyof typeof FILE_TYPES)[];
  maxSize?: number; // in MB
  customErrorMessage?: string;
}

/**
 * Factory function untuk membuat memory storage config yang fleksibel
 * @param options - Konfigurasi untuk tipe file yang diperbolehkan
 * @returns MulterOptions untuk memory storage
 * 
 * @example
 * // Hanya gambar
 * createMemoryConfig({ fileTypes: ['image'] })
 * 
 * // Gambar dan PDF
 * createMemoryConfig({ fileTypes: ['image', 'pdf'] })
 * 
 * // Semua dokumen dengan custom size
 * createMemoryConfig({ fileTypes: ['document'], maxSize: 10 })
 */
export const createMemoryConfig = (options: CreateMemoryConfigOptions): MulterOptions => {
  const { fileTypes, maxSize = 5, customErrorMessage } = options;

  // Gabungkan semua mime types dan extensions dari tipe file yang dipilih
  const allowedMimeTypes: string[] = [];
  const allowedExtensions: string[] = [];
  let errorMessage = customErrorMessage;

  fileTypes.forEach(type => {
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
      const fileExtension = file.originalname.toLowerCase().substring(
        file.originalname.lastIndexOf('.')
      );

      // Jika fileTypes adalah 'any', terima semua file
      if (fileTypes.includes('any')) {
        callback(null, true);
        return;
      }

      // Validasi mime type dan extension
      const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      if (isValidMimeType && isValidExtension) {
        callback(null, true);
      } else {
        callback(new Error(errorMessage || 'Format file tidak valid') as any, false);
      }
    },
    limits: {
      fileSize: maxSize * 1024 * 1024, // Convert MB to bytes
    },
  };
};

interface CreateCloudinaryConfigOptions {
  folder: string;
  fileTypes: (keyof typeof FILE_TYPES)[];
  maxSize?: number; // in MB
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  customErrorMessage?: string;
}

/**
 * Factory function untuk membuat Cloudinary storage config yang fleksibel
 * @param options - Konfigurasi untuk upload ke Cloudinary
 * @returns MulterOptions untuk Cloudinary storage
 * 
 * @example
 * // Upload gambar ke Cloudinary
 * createCloudinaryConfig({ 
 *   folder: 'nestjs/images/profile', 
 *   fileTypes: ['image'],
 *   transformation: [{ width: 500, height: 500, crop: 'limit' }]
 * })
 * 
 * // Upload PDF ke Cloudinary
 * createCloudinaryConfig({ 
 *   folder: 'nestjs/documents', 
 *   fileTypes: ['pdf'],
 *   resourceType: 'raw'
 * })
 */
export const createCloudinaryConfig = (options: CreateCloudinaryConfigOptions): MulterOptions => {
  const { 
    folder, 
    fileTypes, 
    maxSize = 5, 
    resourceType = 'auto',
    transformation = [],
    customErrorMessage 
  } = options;

  // Gabungkan allowed formats
  const allowedFormats: string[] = [];
  fileTypes.forEach(type => {
    const config = FILE_TYPES[type];
    config.extensions.forEach(ext => {
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
// PREDEFINED CONFIGS (untuk backward compatibility)
// ============================================

export const multerConfigMemory = createMemoryConfig({ 
  fileTypes: ['image'] 
});

export const multerConfigImage = createCloudinaryConfig({
  folder: 'nestjs/images/profile',
  fileTypes: ['image'],
  resourceType: 'image',
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
});

export const multerConfigPayment = createCloudinaryConfig({
  folder: 'nestjs/images/payment',
  fileTypes: ['image'],
  resourceType: 'image'
});

export const multerConfigVideo = createCloudinaryConfig({
  folder: 'nestjs/videos',
  fileTypes: ['video'],
  resourceType: 'video',
  maxSize: 100
});

export const multerConfigPdf = createCloudinaryConfig({
  folder: 'nestjs/pdf',
  fileTypes: ['pdf'],
  resourceType: 'raw',
  maxSize: 20
});