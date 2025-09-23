// src/routes/index.js
import { Router } from 'express';
import entradasRoutes from '../entities/entradas/entradas.routes.js';
import salidasRoutes from '../entities/salidas/salidas.routes.js'; // para futuro
import authRoutes from '../auth/auth.routes.js';

const router = Router();

// Rutas
router.use('/entradas', entradasRoutes);
router.use('/salidas', salidasRoutes); 
router.use('/auth', authRoutes)

export default router;
