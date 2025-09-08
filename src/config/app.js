// src/config/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from '../routes/index.js';
import { connectDB } from '../db/mongo.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Para recibir firma en base64
app.use(express.urlencoded({ extended: true }));

// Carpeta de uploads para servir archivos
const uploadsPath = path.join(__dirname, '../../uploads');
console.log("Uploads path:", uploadsPath); // Debug: verificar ruta de uploads
app.use('/uploads', express.static(uploadsPath));

// Configuración de multer (subida de archivos)
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath); // Guarda los archivos en la misma carpeta que se sirve
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

// Rutas
app.use('/api', routes);

// Conexión a DB
connectDB();

// Exportar app
export default app;
