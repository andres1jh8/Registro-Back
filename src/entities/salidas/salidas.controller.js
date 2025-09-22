import { Salida } from './salidas.model.js';
import { Entrada } from '../entradas/entradas.model.js';
import ExcelJS from 'exceljs';  // <--- Esto faltaba
import path from 'path';
import fs from 'fs';


/**
 * Registrar una salida
 */
export const addSalida = async (req, res) => {
  try {

    const { entradaId, horaSalida } = req.body;

    // Validar que la entrada exista
    const entrada = await Entrada.findById(entradaId);
    if (!entrada) {
      return res.status(404).send(
        {
            success: false,
            message: 'No se encontró la entrada correspondiente'
        }
        )
    }

    // Validar que no exista salida previa para esta entrada
    const salidaExistente = await Salida.findOne({ entradaId })

    if (salidaExistente) {
      return res.status(400).send(
        {
            success: false,
            message: 'Ya se registró la salida de esta entrada'
        }
        )
    }

    // Crear nueva salida
    const nuevaSalida = new Salida({ entradaId, horaSalida })
    await nuevaSalida.save();

    res.status(201).send(
        {
            success: true,
            message: 'Salida registrada correctamente',
            data: nuevaSalida
        }
    )

  } catch (err) {
    console.error(err);
    res.status(500).send(
        {
            success: false,
            message: 'Error al registrar salida',
            error: err.message
        }
    )
  }
}

/**
 * Obtener todas las salidas
 */
export const getSalidas = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [salidas, total] = await Promise.all(
        [
            Salida.find().populate('entradaId').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Salida.countDocuments()
        ]
    )

    res.send(
        {
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: salidas
        }
    )
  } catch (err) {
    console.error(err);
    res.status(500).send(
        {
            success: false,
            message: 'Error al cargar salidas',
            error: err.message
        }
    )
  }
}

/**
 * Obtener salida por ID
 */
export const getSalidaById = async (req, res) => {
  try {
    const salida = await Salida.findById(req.params.id).populate('entradaId');

    if (!salida) return res.status(404).send(
        {
            success: false,
            message: 'No se encontró la salida'
        }
    )

    res.send(
        {
            success: true,
            data: salida
        }
    )

  } catch (err) {
    console.error(err);
    res.status(500).send(
        {
            success: false,
            message: 'Error al obtener salida',
            error: err.message
        }
    )
  }
}


export const updateSalida = async (req, res) => {
  try {

    const { horaSalida } = req.body

    const updatedSalida = await Salida.findByIdAndUpdate(
        req.params.id,
        { horaSalida },
        { new: true }
    )

    if (!updatedSalida) return res.status(404).send(
        {
            success: false,
            message: 'Salida no encontrada'
        }
    )

    res.send(
        {
            success: true,
            message: 'Salida actualizada',
            data: updatedSalida
        }
    )

  } catch (err) {
    console.error(err)
    res.status(500).send(
        {
            success: false,
            message: 'Error al actualizar salida',
            error: err.message
        }
    )
  }
}


export const deleteSalida = async (req, res) => {
  try {

    const salida = await Salida.findByIdAndDelete(req.params.id);

    if (!salida) return res.status(404).send(
        {
            success: false,
            message: 'Salida no encontrada'
        }
    )

    res.send(
        {
            success: true,
            message: 'Salida eliminada correctamente'
        }
    )

  } catch (err) {
    console.error(err);
    res.status(500).send(
        {
            success: false,
            message: 'Error al eliminar salida',
            error: err.message
        }
    )
  }
}

export const getReporteMensual = async (req, res) => {
  try {
    const { anio, mes } = req.params;

    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    const salidas = await Salida.find()
      .populate({
        path: 'entradaId',
        match: { fecha: { $gte: inicioMes, $lte: finMes } }
      })
      .sort({ 'entradaId.numero': 1 });

    const salidasFiltradas = salidas
      .filter(s => s.entradaId != null)
      .map(s => ({
        numero: s.entradaId.numero,
        fecha: s.entradaId.fecha,
        horaEntrada: s.entradaId.horaEntrada,
        horaSalida: s.horaSalida,
        nombre: s.entradaId.nombre,
        dpi: s.entradaId.dpi,
        fotoDPI: s.entradaId.fotoDPI,
        motivo: s.entradaId.motivo,
        empresa: s.entradaId.empresa,
        firma: s.entradaId.firma
      }));

    res.status(200).json({
      success: true,
      total: salidasFiltradas.length,
      data: salidasFiltradas
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte mensual',
      error: err.message
    });
  }
};


export const generarExcelReporteMensual = async (req, res) => {
  try {
    const { anio, mes } = req.params;
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    const salidas = await Salida.find()
      .populate({
        path: 'entradaId',
        match: { fecha: { $gte: inicioMes, $lte: finMes } }
      })
      .sort({ 'entradaId.numero': 1 });

    const salidasFiltradas = salidas.filter(s => s.entradaId != null);

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Control';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Reporte Mensual', {
      pageSetup: { paperSize: 9, orientation: 'landscape' } // 9 = tamaño oficio
    });

    // Encabezados
    sheet.columns = [
      { header: 'No.', key: 'numero', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora Entrada', key: 'horaEntrada', width: 15 },
      { header: 'Hora Salida', key: 'horaSalida', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'DPI', key: 'dpi', width: 20 },
      { header: 'Foto DPI', key: 'fotoDPI', width: 20 },
      { header: 'Motivo', key: 'motivo', width: 25 },
      { header: 'Empresa', key: 'empresa', width: 25 },
      { header: 'Firma', key: 'firma', width: 20 }
    ];

    // Agregar filas
    for (let i = 0; i < salidasFiltradas.length; i++) {
      const s = salidasFiltradas[i];
      const entrada = s.entradaId;

      const fila = sheet.addRow({
        numero: entrada.numero,
        fecha: entrada.fecha.toLocaleDateString(),
        horaEntrada: entrada.horaEntrada,
        horaSalida: s.horaSalida,
        nombre: entrada.nombre,
        dpi: entrada.dpi,
        fotoDPI: '', // Lo agregaremos como imagen
        motivo: entrada.motivo,
        empresa: entrada.empresa,
        firma: '' // Lo agregaremos como imagen
      });

      // Foto DPI
      if (entrada.fotoDPI) {
        const fotoPath = path.join('.', entrada.fotoDPI);
        if (fs.existsSync(fotoPath)) {
          const fotoId = workbook.addImage({
            filename: fotoPath,
            extension: path.extname(fotoPath).substring(1)
          });
          sheet.addImage(fotoId, `G${fila.number}:G${fila.number}`);
        }
      }

      // Firma
      if (entrada.firma) {
        const firmaPath = path.join('.', entrada.firma);
        if (fs.existsSync(firmaPath)) {
          const firmaId = workbook.addImage({
            filename: firmaPath,
            extension: path.extname(firmaPath).substring(1)
          });
          sheet.addImage(firmaId, `J${fila.number}:J${fila.number}`);
        }
      }
    }

    // Guardar Excel en carpeta temporal
    const filePath = path.join('uploads', `reporte_${anio}_${mes}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    // Enviar archivo como descarga
    res.download(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al generar Excel',
      error: err.message
    });
  }
};



/**
 * Obtener todas las entradas con su hora de salida (si existe)
 */
export const getMovimientos = async (req, res) => {
  try {
    // Obtener todas las entradas
    const entradas = await Entrada.find().sort({ fecha: -1 });

    // Combinar con la salida correspondiente
    const movimientos = await Promise.all(
      entradas.map(async (entrada) => {
        const salida = await Salida.findOne({ entradaId: entrada._id });

        return {
          _id: entrada._id,
          numero: entrada.numero,
          fecha: entrada.fecha,
          horaEntrada: entrada.horaEntrada,
          horaSalida: salida ? salida.horaSalida : null,
          nombre: entrada.nombre,
          dpi: entrada.dpi,
          fotoDPI: entrada.fotoDPI,
          motivo: entrada.motivo,
          empresa: entrada.empresa,
          firma: entrada.firma,
          createdAt: entrada.createdAt,
          updatedAt: entrada.updatedAt
        };
      })
    );

    res.status(200).json({ success: true, total: movimientos.length, data: movimientos });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: err.message
    });
  }
};
