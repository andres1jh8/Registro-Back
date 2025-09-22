import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from '../routes/index.js';

const app = express();

// ✅ Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Rutas
app.use('/api', routes);

// ✅ Manejo global de errores
app.use((err, req, res, next) => {
  console.error("🔥 Error no controlado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message
  });
});

export default app;
