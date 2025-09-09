// src/entities/entradas/entradas.validators.js
import { check } from 'express-validator';
import { Entrada } from './entradas.model.js';

export const validarEntrada = [
  // Fecha
  check('fecha')
    .optional()
    .isISO8601()
    .withMessage('Fecha debe ser válida')
    .custom((fecha) => {
      const fechaEntrada = new Date(fecha);
      if (fechaEntrada > new Date()) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),

  // Hora de entrada
  check('horaEntrada')
    .notEmpty()
    .withMessage('Hora de entrada es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Hora de entrada debe tener formato HH:MM'),

  // Nombre
  check('nombre')
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ min: 3 })
    .withMessage('Nombre debe tener al menos 3 caracteres'),

  // DPI
  check('dpi')
    .notEmpty()
    .withMessage('DPI es requerido')
    .isLength({ min: 13, max: 13 })
    .withMessage('DPI debe tener 13 dígitos'),

  // Motivo
  check('motivo')
    .notEmpty()
    .withMessage('Motivo es requerido')
    .isLength({ min: 5 })
    .withMessage('Motivo debe tener al menos 5 caracteres'),

  // Empresa
  check('empresa')
    .notEmpty()
    .withMessage('Empresa es requerida'),

  // Firma (archivo o Base64)
  check('firma')
    .custom((value, { req }) => {
      if (!value && !req.files?.firma) {
        throw new Error('Firma es requerida');
      }
      // Si viene en body como Base64, validar formato
      if (value && !/^data:image\/(png|jpeg|jpg);base64,/.test(value)) {
        throw new Error('Firma debe ser una imagen en Base64 (png/jpg/jpeg)');
      }
      return true;
    }),

  // Foto DPI (opcional)
  check('fotoDPI')
    .optional()
    .custom((value, { req }) => {
      if (req.files?.fotoDPI) return true; // archivo enviado
      if (value && !/^.*\.(jpg|jpeg|png)$/.test(value)) {
        throw new Error('Foto DPI debe ser un archivo jpg, jpeg o png');
      }
      return true;
    }),

  // Validación extra: si existe horaSalida, horaEntrada no puede ser posterior
  check('horaEntrada')
    .custom(async (horaEntrada, { req }) => {
      if (req.params.id) {
        const entrada = await Entrada.findById(req.params.id);
        if (entrada && entrada.horaSalida) {
          const [hEntrada, mEntrada] = horaEntrada.split(':').map(Number);
          const [hSalida, mSalida] = entrada.horaSalida.split(':').map(Number);
          if (hEntrada > hSalida || (hEntrada === hSalida && mEntrada > mSalida)) {
            throw new Error('Hora de entrada no puede ser posterior a hora de salida');
          }
        }
      }
      return true;
    }),
];
