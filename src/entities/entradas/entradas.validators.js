import { check } from 'express-validator';
import { Entrada } from './entradas.model.js';

export const validarEntrada = [
  // Fecha
  check('fecha')
    .optional()
    .isISO8601().withMessage('Fecha debe ser válida')
    .custom(fecha => {
      const fechaEntrada = new Date(fecha);
      if (fechaEntrada > new Date()) throw new Error('La fecha no puede ser futura');
      return true;
    }),

  // Hora de entrada
  check('horaEntrada')
    .notEmpty().withMessage('Hora de entrada es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de entrada debe tener formato HH:MM'),

  // Nombre
  check('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isLength({ min: 3 }).withMessage('Nombre debe tener al menos 3 caracteres'),

  // DPI
  check('dpi')
    .notEmpty().withMessage('DPI es requerido')
    .isLength({ min: 13, max: 13 }).withMessage('DPI debe tener 13 dígitos'),

  // Motivo
  check('motivo')
    .notEmpty().withMessage('Motivo es requerido')
    .isLength({ min: 5 }).withMessage('Motivo debe tener al menos 5 caracteres'),

  // Empresa
  check('empresa').notEmpty().withMessage('Empresa es requerida'),

  // Firma
  check('firma').custom((value, { req }) => {
    if (!req.files?.firma || req.files.firma.length === 0) throw new Error('Firma es requerida');
    return true;
  }),

  // Foto DPI (opcional)
  check('fotoDPI').custom((value, { req }) => true), // opcional

  // Validación horaEntrada vs horaSalida (si aplica)
  check('horaEntrada').custom(async (horaEntrada, { req }) => {
    if (req.params.id) {
      const entrada = await Entrada.findById(req.params.id);
      if (entrada && entrada.horaSalida) {
        const [hE, mE] = horaEntrada.split(':').map(Number);
        const [hS, mS] = entrada.horaSalida.split(':').map(Number);
        if (hE > hS || (hE === hS && mE > mS)) throw new Error('Hora de entrada no puede ser posterior a hora de salida');
      }
    }
    return true;
  }),
];
