import { Router } from "express";
import { registerUser, loginUser } from "./auth.controller.js";
import {checkAdmin} from "./check-admin.js"
import { validateJWT } from "../middlewares/validate.jwt.js";

const api = Router();

/**
 * 📌 Rutas de autenticación
 */
api.post("/register", registerUser); // Registro protegido en el controller con admin credentials
api.post("/login", loginUser); // Inicio de sesión y generación de token

// Nueva ruta para validación de admin en tiempo real
api.post("/check-admin", checkAdmin);

api.get("/test", validateJWT, (req, res) => {
  res.json({ message: "Token válido" });
});

export default api;
