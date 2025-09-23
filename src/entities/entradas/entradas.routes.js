import { Router } from "express";
import { addEntrada, getEntradas, getEntradasById, updateEntrada, deleteEntrada, getMeses } from "./entradas.controller.js";
import { validarEntrada } from "./entradas.validators.js";
import { validateFields } from "../../middlewares/validate-fields.js";
import { upload } from "../../config/cloudinary.js";
import { validateJWT, validateRoles } from "../../middlewares/validate.jwt.js";

const router = Router();

// POST crear entrada
router.post(
  "/",
  upload.fields([
    { name: "firma", maxCount: 1 },
    { name: "fotoDPI", maxCount: 1 }
  ]),
  //validateJWT,
  //validateRoles("Admin","Employee"),
  validarEntrada,
  validateFields,
  addEntrada
);

// GET //todas las entradas
router.get("/",
  //[
    //validateJWT,
    //validateRoles("Admin","Employee")
  //],  
getEntradas);

// GET entradas por meses
router.get("/meses", 
  //[
  //  validateJWT,
 //   validateRoles("Admin","Employee")
 // ], 
getMeses);

// GET entrada por ID
router.get("/:id", getEntradasById);

// PUT actualizar entrada
router.put(
  "/:id",
  upload.fields([
    { name: "firma", maxCount: 1 },
    { name: "fotoDPI", maxCount: 1 }
  ]),
 // validateJWT,
  //validateRoles("Admin","Employee"),
  validarEntrada,
  validateFields,
  updateEntrada
);

// DELETE entrada
router.delete("/:id", 
 // [
  //  validateJWT,
 //   validateRoles("Admin","Employee"),
 // ],
deleteEntrada);

export default router;
