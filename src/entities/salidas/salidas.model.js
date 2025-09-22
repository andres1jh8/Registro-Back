import mongoose from "mongoose"

const { Schema, model ,Types } = mongoose;

const salidaSchema = new Schema (
    {
        entradaId: {
            type: Types.ObjectId,
            ref: "Entrada",
            required: true
        },
        horaSalida: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export const Salida = model("Salida", salidaSchema)