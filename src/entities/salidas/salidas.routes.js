import { Router } from "express";
import { 
  addSalida, 
  getSalidas, 
  getSalidaById, 
  updateSalida, 
  deleteSalida,
  getReporteMensual,
  generarExcelReporteMensual,
  getMovimientos
} from "./salidas.controller.js";
import { validateAddSalida, validateUpdateSalida } from "./salidas.validators.js";
import { validateJWT, validateRoles } from "../../middlewares/validate.jwt.js";

const router = Router();

// Get de movimientos
router.get(
  "/movimientos",
  validateJWT,
  validateRoles("Admin", "Employee"),
  getMovimientos
);

// Registrar salida
router.post(
  "/",
  validateJWT,
  validateRoles("Admin", "Employee"),
  validateAddSalida,
  addSalida
);

// Listar todas las salidas
router.get(
  "/",
  validateJWT,
  validateRoles("Admin", "Employee"),
  getSalidas
);

// Obtener salida por ID
router.get(
  "/:id",
  validateJWT,
  validateRoles("Admin", "Employee"),
  getSalidaById
);

// Actualizar salida
router.put(
  "/:id",
  validateJWT,
  validateRoles("Admin", "Employee"),
  validateUpdateSalida,
  updateSalida
);

// Eliminar salida
router.delete(
  "/:id",
  validateJWT,
  validateRoles("Admin"),
  deleteSalida
);

// Reportes por Año y Mes
router.get(
  "/reporte/:anio/:mes",
  validateJWT,
  validateRoles("Admin", "Employee"),
  getReporteMensual
);

// Descargar Excel mensual
router.get(
  "/reporte/excel/:anio/:mes",
  validateJWT,
  validateRoles("Admin", "Employee"),
  generarExcelReporteMensual
);

export default router;
