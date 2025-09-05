import { Router } from 'express';
import { 
  addSalida, 
  getSalidas, 
  getSalidaById, 
  updateSalida, 
  deleteSalida,
  getReporteMensual,
  generarExcelReporteMensual,
  getMovimientos
} from './salidas.controller.js';
import { validateAddSalida, validateUpdateSalida } from './salidas.validators.js';

const router = Router();

//Get de todo
router.get('/movimientos', getMovimientos);

// Registrar salida
router.post('/', validateAddSalida, addSalida);

// Listar todas las salidas
router.get('/', getSalidas);

// Obtener salida por ID
router.get('/:id', getSalidaById);

// Actualizar salida
router.put('/:id', validateUpdateSalida, updateSalida);

// Eliminar salida
router.delete('/:id', deleteSalida);

//Reportes por Año y Mes
router.get('/reporte/:anio/:mes', getReporteMensual);

// Descargar Excel mensual
router.get('/reporte/excel/:anio/:mes', generarExcelReporteMensual);



export default router;
