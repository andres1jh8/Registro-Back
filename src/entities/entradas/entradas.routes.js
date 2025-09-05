// src/entities/entradas/entradas.routes.js
import { Router } from 'express';
import {
  addEntrada,
  getEntradas,
  getEntradasById,
  updateEntrada,
  deleteEntrada,
  getMeses
} from './entradas.controller.js';
import { validarEntrada } from './entradas.validators.js';
import { validateFields } from '../../middlewares/validate-fields.js';
import multer from 'multer';
import path from 'path';

// 🔹 Configuración de multer para subir archivos (fotoDPI y firma)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Carpeta donde se guardan las imágenes
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const field = file.fieldname; // 'fotoDPI' o 'firma'
    cb(null, `${field}-${Date.now()}${ext}`); // ej: fotoDPI-1693665432100.png
  }
});

const upload = multer({ storage });

const router = Router();

// 🔹 POST: crear entrada y subir archivos
// ⚠️ upload.fields permite recibir múltiples archivos con nombres distintos
router.post(
  '/',
  upload.fields([
    { name: 'fotoDPI', maxCount: 1 }, // Recibe 1 archivo con campo 'fotoDPI'
    { name: 'firma', maxCount: 1 }    // Recibe 1 archivo con campo 'firma'
  ]),
  validarEntrada,
  validateFields,
  addEntrada
);

// 🔹 GET todas las entradas
router.get('/', getEntradas);

router.get("/meses", getMeses);
// 🔹 GET entrada por ID
router.get('/:id', getEntradasById);

// 🔹 PUT: actualizar entrada y subir nuevos archivos si los hay
router.put(
  '/:id',
  upload.fields([
    { name: 'fotoDPI', maxCount: 1 },
    { name: 'firma', maxCount: 1 }
  ]),
  validarEntrada,
  validateFields,
  updateEntrada
);

// 🔹 DELETE entrada
router.delete('/:id', deleteEntrada);

export default router;
