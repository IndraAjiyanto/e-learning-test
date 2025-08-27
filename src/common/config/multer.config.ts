import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

export const multerConfigImage = {
  storage: diskStorage({
    destination: './uploads/images/profile',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),


  fileFilter: (req: Request, file, cb) => {
    const { mimetype } = file;

    if (mimetype.startsWith('image/')) {
      if (['image/jpeg', 'image/png'].includes(mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG and PNG images are allowed!'), false);
      }
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  },

  limits: {
    fileSize: 1024 * 1024
  },
};

export const multerConfigPayment = {
  storage: diskStorage({
    destination: './uploads/images/payment',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),


  fileFilter: (req: Request, file, cb) => {
    const { mimetype } = file;

    if (mimetype.startsWith('image/')) {
      if (['image/jpeg', 'image/png'].includes(mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG and PNG images are allowed!'), false);
      }
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  },

  limits: {
    fileSize: 1024 * 1024
  },
};

export const multerConfigVideo = {
  storage: diskStorage({
    destination: './uploads/videos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),

  fileFilter: (req: Request, file, cb) => {
    const { mimetype } = file;

    if (mimetype.startsWith('video/')) {
      if (mimetype === 'video/mp4') {
        cb(null, true);
      } else {
        cb(new Error('Only MP4 videos are allowed!'), false);
      }
    }  else {
      cb(new Error('Unsupported file type!'), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
};

export const multerConfigPdf = {
  storage: diskStorage({
    destination: './uploads/pdf',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),

  fileFilter: (req: Request, file, cb) => {
    const { mimetype } = file;

    if (mimetype === 'application/pdf') {
      cb(null, true); 

    }else {
      cb(new Error('Unsupported file type!'), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
};

export const multerConfigPpt = {
  storage: diskStorage({
    destination: './uploads/ppt',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),

  fileFilter: (req: Request, file, cb) => {
    const { mimetype } = file;
     if(mimetype === 'application/vnd.ms-powerpoint' || mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
        cb(null, true)
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024 , 
  },
};
