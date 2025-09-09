import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from '../routes/index.js';
import { connectDB } from '../db/mongo.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Conexión a DB
connectDB();

export default app;
