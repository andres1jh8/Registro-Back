// src/routes/index.js
import { Router } from 'express';
import entradasRoutes from '../entities/entradas/entradas.routes.js';
import salidasRoutes from '../entities/salidas/salidas.routes.js'; // para futuro

const router = Router();

// Rutas
router.use('/entradas', entradasRoutes);
router.use('/salidas', salidasRoutes); 

export default router;
