// src/utils/jwt.js
"use strict";

import jwt from "jsonwebtoken";

// Generar un nuevo token JWT
export const generateToken = async (payload) => {
  try {
    return jwt.sign(
      payload,
      process.env.SECRET_KEY, // Usa SECRET_KEY como en .env
      {
        expiresIn: "2h",
        algorithm: "HS256",
      }
    );
  } catch (err) {
    console.error("❌ Error al generar JWT:", err);
    return err;
  }
};
