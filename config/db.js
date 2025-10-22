import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGO_URI non défini dans les variables d’environnement');
    }

    console.log('Connexion à MongoDB avec URI:', mongoUri);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
