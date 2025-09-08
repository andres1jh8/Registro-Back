// src/db/mongo.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ya no pongas useNewUrlParser ni useUnifiedTopology
    console.log('✅ MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

