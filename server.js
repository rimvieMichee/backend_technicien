import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
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
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ou mettre ton front-end
    methods: ["GET", "POST"]
  }
});

// Middleware pour rendre io accessible dans les controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/missions", missionRoutes);

// Swagger
swaggerDocs(app);

// Route test simple
app.get("/", (req, res) => {
  res.send("Serveur Node.js + MongoDB fonctionne !");
});

// Socket.IO : gestion des connexions
io.on("connection", (socket) => {
  console.log("Utilisateur connecté, socket id:", socket.id);

  // Rejoindre la room de l'utilisateur (utiliser _id MongoDB)
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`Utilisateur ${userId} rejoint sa room`);
  });

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté, socket id:", socket.id);
  });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur en cours sur http://localhost:${PORT}`);
});

// Export io si besoin ailleurs
export { io };
