import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder:          'codelearn/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 450, crop: 'fill' }],
  },
});

export const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: (req, file) => ({
    folder:        'codelearn/pdfs',
    resource_type: 'raw',
    public_id:     `pdf-${Date.now()}`,
  }),
});

export const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder:          'codelearn/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  },
});

export const uploadImage  = multer({ storage: imageStorage });
export const uploadPdf    = multer({ storage: pdfStorage });
export const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 } });

export default cloudinary.v2;