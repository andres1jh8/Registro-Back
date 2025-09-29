// src/seeds/entradas.default.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Entrada } from "../entities/entradas/entradas.model.js";

dotenv.config();

const empresas = ["Contraloría", "SAT", "BANRURAL", "Claro", "Tigo"];
const motivos = ["Reunión", "Entrega", "Visita", "Capacitación", "Supervisión"];

function randomHora() {
  const h = Math.floor(Math.random() * 8) + 8; // entre 8 y 15 hrs
  const m = Math.floor(Math.random() * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

async function seedEntradas() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpia la colección antes de insertar
    await Entrada.deleteMany({});
    console.log("🗑️ Entradas anteriores eliminadas");

    const entradas = [];
    let numero = 1;

    for (let mes = 0; mes < 12; mes++) {
      for (let i = 0; i < 5; i++) {
        const fecha = new Date(2025, mes, Math.floor(Math.random() * 28) + 1);
        fecha.setHours(0, 0, 0, 0);

        const entrada = new Entrada({
          numero: numero++,
          fecha,
          horaEntrada: randomHora(),
          nombre: `Persona ${mes + 1}-${i + 1}`,
          dpi: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`, // 13 dígitos
          motivo: motivos[Math.floor(Math.random() * motivos.length)],
          empresa: empresas[Math.floor(Math.random() * empresas.length)],
          firma: "https://via.placeholder.com/150x50.png?text=Firma",
          fotoDPI: "https://via.placeholder.com/150x100.png?text=DPI"
        });

        entradas.push(entrada);
      }
    }

    await Entrada.insertMany(entradas);
    console.log(`✅ Se insertaron ${entradas.length} entradas por defecto`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error al insertar entradas:", err);
    process.exit(1);
  }
}

seedEntradas();
