import { check } from 'express-validator';
import { validateFields } from '../../middlewares/validate-fields.js';
import mongoose from 'mongoose';

export const validateAddSalida = [
  check('entradaId')
    .notEmpty().withMessage('entradaId es obligatorio')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('entradaId no es un ID válido'),
  
  check('horaSalida')
    .notEmpty().withMessage('horaSalida es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('horaSalida debe tener formato HH:mm'),

  validateFields
];

export const validateUpdateSalida = [
  check('horaSalida')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('horaSalida debe tener formato HH:mm'),

  validateFields
];
