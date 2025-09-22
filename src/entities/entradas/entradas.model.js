import mongoose from "mongoose"

const { Schema, model } = mongoose

const entradaSchema = new Schema (
    {
        numero: {
            type: Number, 
            required: true
        },
        fecha: {
            type: Date,
            required: true
        },
        horaEntrada: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        dpi: {
            type: String, 
            required: true
        },
        fotoDPI: {
            type: String
        },
        motivo: {
            type: String,
            required: true
        },
        empresa: {
            type: String,
            required: true
        },
        firma: { 
            type: String,
            required: true
        },
    },
    { timestamps: true }
)

export const Entrada = model("Entrada", entradaSchema);