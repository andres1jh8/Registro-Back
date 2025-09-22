import fs from 'fs';
import https from 'https';
import app from './src/config/app.js';
import { connectDB } from './src/db/mongo.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const pemPath = './cert/contraloria_completo.pem';

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB conectado correctamente');

    const pem = fs.readFileSync(pemPath, 'utf8');

    const server = https.createServer({ key: pem, cert: pem }, app);

    server.keepAliveTimeout = 60000;
    server.headersTimeout = 65000;

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor HTTPS corriendo en https://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor:", error);
    console.error(error.stack);
  }
};

startServer();
