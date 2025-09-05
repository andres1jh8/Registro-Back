import { Entrada } from './entradas.model.js';
import { Salida } from '../salidas/salidas.model.js';
import fs from 'fs';
import path from 'path';

const ajustarFechaLocal = (fechaStr) => {
  const fecha = fechaStr ? new Date(fechaStr) : new Date();
  const tzOffset = fecha.getTimezoneOffset();
  const fechaLocal = new Date(fecha.getTime() + tzOffset * 60000);
  fechaLocal.setHours(0, 0, 0, 0);
  return fechaLocal;
};

export const addEntrada = async (req, res) => {
  try {
    const { fecha, horaEntrada, nombre, dpi, motivo, empresa } = req.body;

    if (!horaEntrada || !nombre || !dpi || !motivo || !empresa) {
      let errors = {};
      if (!horaEntrada) errors.horaEntrada = "Hora de entrada es obligatoria";
      if (!nombre) errors.nombre = "Nombre es obligatorio";
      if (!dpi) errors.dpi = "DPI es obligatorio";
      if (!motivo) errors.motivo = "Motivo es obligatorio";
      if (!empresa) errors.empresa = "Empresa es obligatoria";
      return res.status(400).send({ success: false, errors });
    }

    const fechaEntrada = ajustarFechaLocal(fecha);
    const inicioMes = new Date(fechaEntrada.getFullYear(), fechaEntrada.getMonth(), 1);
    const finMes = new Date(fechaEntrada.getFullYear(), fechaEntrada.getMonth() + 1, 0);

    const ultimaEntrada = await Entrada.findOne({
      fecha: { $gte: inicioMes, $lte: finMes }
    }).sort({ numero: -1 });

    const nuevoNumero = ultimaEntrada ? ultimaEntrada.numero + 1 : 1;

    let firmaNombre = null;
    let fotoDPINombre = null;

    if (req.files) {
      if (req.files.firma && req.files.firma[0]) {
        const ext = path.extname(req.files.firma[0].originalname);
        firmaNombre = `${dpi}-${Date.now()}${ext}`;
        fs.renameSync(req.files.firma[0].path, path.join('uploads', firmaNombre));
      }
      if (req.files.fotoDPI && req.files.fotoDPI[0]) {
        const ext = path.extname(req.files.fotoDPI[0].originalname);
        fotoDPINombre = `${dpi}-${Date.now()}${ext}`;
        fs.renameSync(req.files.fotoDPI[0].path, path.join('uploads', fotoDPINombre));
      }
    }

    if (!firmaNombre && req.body.firma) {
      const base64Data = req.body.firma.replace(/^data:image\/png;base64,/, '');
      const fileName = `${dpi}-${Date.now()}.png`;
      fs.writeFileSync(path.join('uploads', fileName), base64Data, 'base64');
      firmaNombre = fileName;
    }

    const nuevaEntrada = new Entrada({
      numero: nuevoNumero,
      fecha: fechaEntrada,
      horaEntrada,
      nombre,
      dpi,
      motivo,
      empresa,
      fotoDPI: fotoDPINombre,
      firma: firmaNombre
    });

    await nuevaEntrada.save();

    res.status(201).send({
      success: true,
      message: 'Entrada registrada',
      data: nuevaEntrada
    });

  } catch (err) {
    console.error("Error al registrar entrada:", err);
    res.status(500).send({
      success: false,
      message: "Error al registrar entrada",
      error: err.message
    });
  }
};

export const updateEntrada = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (updateData.fecha) {
      updateData.fecha = ajustarFechaLocal(updateData.fecha);
    }

    if (req.files) {
      if (req.files.firma && req.files.firma[0]) {
        const ext = path.extname(req.files.firma[0].originalname);
        const firmaNombre = `${updateData.dpi || 'firma'}-${Date.now()}${ext}`;
        fs.renameSync(req.files.firma[0].path, path.join('uploads', firmaNombre));
        updateData.firma = firmaNombre;
      } else if (req.body.firma) {
        const base64Data = req.body.firma.replace(/^data:image\/png;base64,/, '');
        const fileName = `${updateData.dpi || 'firma'}-${Date.now()}.png`;
        fs.writeFileSync(path.join('uploads', fileName), base64Data, 'base64');
        updateData.firma = fileName;
      }
      if (req.files.fotoDPI && req.files.fotoDPI[0]) {
        const ext = path.extname(req.files.fotoDPI[0].originalname);
        const fotoDPINombre = `${updateData.dpi || 'dpi'}-${Date.now()}${ext}`;
        fs.renameSync(req.files.fotoDPI[0].path, path.join('uploads', fotoDPINombre));
        updateData.fotoDPI = fotoDPINombre;
      }
    }

    const updatedEntrada = await Entrada.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedEntrada) return res.status(404).send({
      success: false,
      message: 'Entrada no encontrada'
    });

    res.send({ success: true, message: 'Entrada actualizada', data: updatedEntrada });

  } catch (err) {
    res.status(500).send({
      success: false,
      message: 'Error al actualizar entrada',
      error: err.message
    });
  }
};

export const getEntradas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const month = req.query.month ? parseInt(req.query.month) : null;
    const year = req.query.year ? parseInt(req.query.year) : null;
    const all = req.query.all === "true";

    // 🔎 nuevos filtros
    const dpi = req.query.dpi || null;
    const empresa = req.query.empresa || null;

    const matchStage = {};
    if (month && year) {
      matchStage.fecha = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }

    if (dpi) {
      matchStage.dpi = dpi; // búsqueda exacta
    }

    if (empresa) {
      // Usamos regex para búsqueda parcial e insensible a mayúsculas
      matchStage.empresa = { $regex: empresa, $options: "i" };
    }

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

    const entradasConUrl = entradas.map((entrada) => ({
      ...entrada,
      firma: entrada.firma ? `${req.protocol}://${req.get('host')}/uploads/${entrada.firma}` : null,
      fotoDPI: entrada.fotoDPI ? `${req.protocol}://${req.get('host')}/uploads/${entrada.fotoDPI}` : null
    }));

    res.send({
      success: true,
      data: entradasConUrl,
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

export const getEntradasById = async (req, res) => {
  try {
    const entrada = await Entrada.aggregate([
      { $match: { _id: Entrada.db.bson_serializer.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'salidas',
          localField: '_id',
          foreignField: 'entradaId',
          as: 'salidas'
        }
      }
    ]);

    if (!entrada || entrada.length === 0) return res.status(404).send({ success: false, message: "No se encontró la Entrada" });

    const entradaConUrl = {
      ...entrada[0],
      firma: entrada[0].firma ? `${req.protocol}://${req.get('host')}/uploads/${entrada[0].firma}` : null,
      fotoDPI: entrada[0].fotoDPI ? `${req.protocol}://${req.get('host')}/uploads/${entrada[0].fotoDPI}` : null
    };

    res.send({ success: true, data: entradaConUrl });

  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error al obtener Entrada", error: err.message });
  }
};

export const deleteEntrada = async (req, res) => {
  try {
    const entrada = await Entrada.findByIdAndDelete(req.params.id);
    if (!entrada) return res.status(404).send({ success: false, message: 'Entrada no encontrada' });
    res.send({ success: true, message: 'Entrada eliminada correctamente' });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Error al eliminar entrada', error: err.message });
  }
};
