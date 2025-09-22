// src/entities/entradas/entradas.controller.js
import { Entrada } from './entradas.model.js';
import { Salida } from '../salidas/salidas.model.js';
import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper para subir buffer a Cloudinary
const uploadToCloudinary = (fileBuffer, folder, public_id) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Ajusta fecha al huso horario local
const ajustarFechaLocal = (fechaStr) => {
  const fecha = fechaStr ? new Date(fechaStr) : new Date();
  const tzOffset = fecha.getTimezoneOffset();
  const fechaLocal = new Date(fecha.getTime() + tzOffset * 60000);
  fechaLocal.setHours(0, 0, 0, 0);
  return fechaLocal;
};

// ================== ADD ENTRADA ==================
export const addEntrada = async (req, res) => {
  try {
    const { fecha, horaEntrada, nombre, dpi, motivo, empresa } = req.body;

    // Validaciones básicas
    if (!horaEntrada || !nombre || !dpi || !motivo || !empresa) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }
    if (!req.files?.firma || req.files.firma.length === 0) {
      return res.status(400).json({ success: false, message: "Firma obligatoria" });
    }

    // Ajustar fecha
    const fechaEntrada = fecha ? new Date(fecha) : new Date();
    fechaEntrada.setHours(0, 0, 0, 0);

    // Número del mes
    const inicioMes = new Date(fechaEntrada.getFullYear(), fechaEntrada.getMonth(), 1);
    const finMes = new Date(fechaEntrada.getFullYear(), fechaEntrada.getMonth() + 1, 0);
    const ultimaEntrada = await Entrada.findOne({ fecha: { $gte: inicioMes, $lte: finMes } }).sort({ numero: -1 });
    const nuevoNumero = ultimaEntrada ? ultimaEntrada.numero + 1 : 1;

    // URLs de Multer + CloudinaryStorage
    const firmaUrl = req.files.firma[0].path;
    const fotoDPIUrl = req.files.fotoDPI?.[0]?.path || null;

    const nuevaEntrada = new Entrada({
      numero: nuevoNumero,
      fecha: fechaEntrada,
      horaEntrada,
      nombre,
      dpi,
      motivo,
      empresa,
      firma: firmaUrl,
      fotoDPI: fotoDPIUrl
    });

    await nuevaEntrada.save();

    res.status(201).json({
      success: true,
      message: "Entrada registrada",
      data: nuevaEntrada
    });
  } catch (err) {
    console.error("Error al registrar entrada:", err);
    res.status(500).json({
      success: false,
      message: "Error al registrar entrada",
      error: err.message
    });
  }
};




// ================== UPDATE ENTRADA ==================
export const updateEntrada = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (updateData.fecha) {
      updateData.fecha = ajustarFechaLocal(updateData.fecha);
    }

    // Nueva firma
    if (req.files?.firma?.[0]) {
      const result = await uploadToCloudinary(
        req.files.firma[0].buffer,
        "firmas",
        `${updateData.dpi || 'firma'}-${Date.now()}`
      );
      updateData.firma = result.secure_url;
    } else if (req.body.firma) {
      const result = await cloudinary.uploader.upload(req.body.firma, {
        folder: "firmas",
        public_id: `${updateData.dpi || 'firma'}-${Date.now()}`
      });
      updateData.firma = result.secure_url;
    }

    // Nueva foto DPI
    if (req.files?.fotoDPI?.[0]) {
      const result = await uploadToCloudinary(
        req.files.fotoDPI[0].buffer,
        "dpi",
        `${updateData.dpi || 'dpi'}-${Date.now()}`
      );
      updateData.fotoDPI = result.secure_url;
    }

    const updatedEntrada = await Entrada.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEntrada) {
      return res.status(404).send({
        success: false,
        message: 'Entrada no encontrada'
      });
    }

    res.send({
      success: true,
      message: 'Entrada actualizada',
      data: updatedEntrada
    });

  } catch (err) {
    console.error("Error en updateEntrada:", err);
    res.status(500).send({
      success: false,
      message: 'Error al actualizar entrada',
      error: err.message
    });
  }
};

// ================== GET ENTRADAS ==================
export const getEntradas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const month = req.query.month ? parseInt(req.query.month) : null;
    const year = req.query.year ? parseInt(req.query.year) : null;
    const all = req.query.all === "true";

    const dpi = req.query.dpi || null;
    const empresa = req.query.empresa || null;

    const matchStage = {};
    if (month && year) {
      matchStage.fecha = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }

    if (dpi) matchStage.dpi = dpi;
    if (empresa) matchStage.empresa = { $regex: empresa, $options: "i" };

    const aggregatePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'salidas',
          localField: '_id',
          foreignField: 'entradaId',
          as: 'salidas'
        }
      },
      { $sort: { numero: 1 } }
    ];

    if (!all) {
      aggregatePipeline.push({ $skip: (page - 1) * limit });
      aggregatePipeline.push({ $limit: limit });
    }

    const entradas = await Entrada.aggregate(aggregatePipeline);
    const total = await Entrada.countDocuments(matchStage);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.send({
      success: true,
      data: entradas,
      page,
      totalPages,
      month: month || null,
      year: year || null,
      dpi: dpi || null,
      empresa: empresa || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Error al cargar Entradas",
      error: err.message
    });
  }
};

// ================== GET MESES ==================
export const getMeses = async (req, res) => {
  try {
    const meses = await Entrada.aggregate([
      {
        $lookup: {
          from: 'salidas',
          localField: '_id',
          foreignField: 'entradaId',
          as: 'salidas'
        }
      },
      { $match: { 'salidas.0': { $exists: true } } },
      {
        $group: {
          _id: { year: { $year: "$fecha" }, month: { $month: "$fecha" } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    res.send({
      success: true,
      meses: meses.map(m => ({
        month: m._id.month,
        year: m._id.year
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error al obtener meses", error: err.message });
  }
};

// ================== GET ENTRADA BY ID ==================
export const getEntradasById = async (req, res) => {
  try {
    const entrada = await Entrada.findById(req.params.id).populate('salidas');

    if (!entrada)
      return res.status(404).send({ success: false, message: "No se encontró la Entrada" });

    res.send({ success: true, data: entrada });

  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error al obtener Entrada", error: err.message });
  }
};

// ================== DELETE ENTRADA ==================
export const deleteEntrada = async (req, res) => {
  try {
    const entrada = await Entrada.findByIdAndDelete(req.params.id);
    if (!entrada) return res.status(404).send({ success: false, message: 'Entrada no encontrada' });
    res.send({ success: true, message: 'Entrada eliminada correctamente' });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Error al eliminar entrada', error: err.message });
  }
};
