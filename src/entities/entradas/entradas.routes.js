import { Router } from "express";
import { addEntrada, getEntradas, getEntradasById, updateEntrada, deleteEntrada, getMeses } from "./entradas.controller.js";
import { validarEntrada } from "./entradas.validators.js";
import { validateFields } from "../../middlewares/validate-fields.js";
import { upload } from "../../config/cloudinary.js";

const router = Router();

// POST crear entrada
router.post(
  "/",
  upload.fields([
    { name: "firma", maxCount: 1 },
    { name: "fotoDPI", maxCount: 1 }
  ]),
  validarEntrada,
  validateFields,
  addEntrada
);

// GET todas las entradas
router.get("/", getEntradas);

// GET entradas por meses
router.get("/meses", getMeses);

// GET entrada por ID
router.get("/:id", getEntradasById);

// PUT actualizar entrada
router.put(
  "/:id",
  upload.fields([
    { name: "firma", maxCount: 1 },
    { name: "fotoDPI", maxCount: 1 }
  ]),
  validarEntrada,
  validateFields,
  updateEntrada
);

// DELETE entrada
router.delete("/:id", deleteEntrada);

export default router;
