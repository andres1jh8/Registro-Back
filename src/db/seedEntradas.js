import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Entrada } from "../entities/entradas/entradas.model.js";
import { connectDB } from "./mongo.js";

const seedEntradas = async () => {
  await connectDB();

  // Obtener el último número
  const ultimaEntrada = await Entrada.findOne().sort({ numero: -1 });
  let siguienteNumero = ultimaEntrada ? ultimaEntrada.numero + 1 : 1;

  const ejemploEntradas = [
    { fecha: new Date("2025-08-26"), horaEntrada: "09:30", nombre: "Juan Pérez", dpi: "1234567890129", motivo: "reunion de emergencia", empresa: "CGC", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-26"), horaEntrada: "10:00", nombre: "Ana Gómez", dpi: "2234567890129", motivo: "visita técnica", empresa: "ABC", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-26"), horaEntrada: "10:15", nombre: "Carlos Ruiz", dpi: "3234567890129", motivo: "entrega de documentos", empresa: "DEF", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-27"), horaEntrada: "08:45", nombre: "María López", dpi: "4234567890129", motivo: "reunion semanal", empresa: "XYZ", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-27"), horaEntrada: "09:10", nombre: "Luis Martínez", dpi: "5234567890129", motivo: "capacitacion", empresa: "LMN", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-28"), horaEntrada: "11:00", nombre: "Sofía Hernández", dpi: "6234567890129", motivo: "reunion de proyecto", empresa: "OPQ", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-28"), horaEntrada: "11:30", nombre: "Andrés Torres", dpi: "7234567890129", motivo: "inspeccion", empresa: "RST", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-29"), horaEntrada: "08:00", nombre: "Paola Méndez", dpi: "8234567890129", motivo: "auditoria", empresa: "UVW", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-29"), horaEntrada: "09:20", nombre: "Diego Ramírez", dpi: "9234567890129", motivo: "entrega de reporte", empresa: "XYZ", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-30"), horaEntrada: "10:45", nombre: "Valeria Jiménez", dpi: "10234567890129", motivo: "capacitacion", empresa: "ABC", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-30"), horaEntrada: "11:15", nombre: "Ricardo Fernández", dpi: "11234567890129", motivo: "reunion interna", empresa: "DEF", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-31"), horaEntrada: "08:30", nombre: "Camila Ortega", dpi: "12234567890129", motivo: "auditoria", empresa: "LMN", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-08-31"), horaEntrada: "09:50", nombre: "Fernando Castillo", dpi: "13234567890129", motivo: "capacitacion", empresa: "OPQ", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-09-01"), horaEntrada: "10:10", nombre: "Isabel Morales", dpi: "14234567890129", motivo: "entrega de documentos", empresa: "RST", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
    { fecha: new Date("2025-09-01"), horaEntrada: "11:00", nombre: "Javier Soto", dpi: "15234567890129", motivo: "reunion de proyecto", empresa: "UVW", firma: "firma-dummy.png", fotoDPI: "firma-dummy.png" },
  ];

  // Agregar el número a cada entrada
  const entradasConNumero = ejemploEntradas.map(e => ({
    ...e,
    numero: siguienteNumero++
  }));

  await Entrada.insertMany(entradasConNumero);
  console.log("✅ 15 entradas insertadas correctamente");
  process.exit();
};

seedEntradas();
