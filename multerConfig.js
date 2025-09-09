import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'imagenes_app', // nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

export const upload = multer({ storage });
