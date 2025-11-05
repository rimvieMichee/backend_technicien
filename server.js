import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./auth/route/user.route.js";
import missionRoutes from "./mission/route/mission.route.js";


// Swagger
import swaggerDocs from "./swagger.js";

dotenv.config(); // Charger les variables d'environnement

// Vérification des variables d'environnement (debug)
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI non défini dans les variables d'environnement");
  process.exit(1);
}


// Connexion à MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/missions", missionRoutes); // Route missions

// Swagger
swaggerDocs(app);

// Route test simple
app.get("/", (req, res) => {
  res.send("Serveur Node.js + MongoDB fonctionne !");
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours sur http://localhost:${PORT}`);
});
