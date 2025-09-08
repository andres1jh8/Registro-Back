// index.js
import 'dotenv/config';
import app from './src/config/app.js';
import { connectDB } from './src/db/mongo.js';

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB antes de iniciar el servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://10.10.96.7:${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor porque falló la conexión a MongoDB:", error.message);
  }
};

startServer();
