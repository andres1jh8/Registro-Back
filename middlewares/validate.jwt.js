//middlewares/validate.jwt.js
"use strict";

import jwt from "jsonwebtoken";
import { findUser } from "../utils/db.validators.js";

export const validateJWT = async (req, res, next) => {
  try {
    const secretKey = process.env.SECRET_KEY;
    const { authorization } = req.headers;

    if (!authorization) {
      return res
        .status(401)
        .send({ message: "Unauthorized - No token provided 1" });
    }

    // Verificar el token
    const user = jwt.verify(authorization, secretKey);

    // Cargar el usuario de la base de datos para obtener el valor actual de updateAt
    const validateUser = await findUser(user.uid)
    if (!validateUser) {
      return res.status(401).send({ message: "Unauthorized - User not found 2" });
    }

    req.user = {
      id: user._id,        
      uid: user._id,       
      username: user.username,
      role: user.role,     
      email: user.email
    }
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err);
    return res.status(401).json({ message: "Invalid token", err});
  }
};

export const validateRoles = (...allowedRoles) =>{
    return async (req, res, next) =>{
        try{
            const {user} = req

            if(!user) return res.status(403).send(
                {
                    success: false,
                    message: 'Usuario no autenticado'
                }
            )
            if(!allowedRoles.includes(user.role)) return res.status(403).send(
                {
                    success: false,
                    message: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}`
                }
            )
            next()
        }catch(e){
            console.error(e)
            return res.status(500).send(
                {
                    success: false,
                    message: 'General Error ValidRol'
                }
            )
        }
    }
}