import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// 🔥 Import des modèles pour Socket.IO
import Message from "./chat/model/Message.js";
import Chat from "./chat/model/Chat.js";

// Routes
import userRoutes from "./auth/route/user.route.js";
import missionRoutes from "./mission/route/mission.route.js";
import chatRoute from "./chat/route/chat.route.js";
import notificationRoute from "./notification/route/notification.route.js";
import rapportRoute from "./mission/route/rapport.route.js";

// Swagger
import swaggerDocs from "./swagger.js";

dotenv.config();

// --- Vérification MongoDB ---
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI non défini dans .env");
  process.exit(1);
}
connectDB();

const app = express();
const server = http.createServer(app);

// --- ⚡ Configuration Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: "*", // à restreindre en prod
    methods: ["GET", "POST"],
  },
});

// --- Middleware global pour injecter io dans req ---
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Middlewares Express ---
app.use(cors());
app.use(express.json());

// --- Routes API ---
app.use("/api/users", userRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/chat", chatRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/rapports", rapportRoute);

// --- Swagger Docs ---
swaggerDocs(app);

// --- Route test ---
app.get("/", (req, res) => {
  res.send(" Serveur Node.js + MongoDB fonctionne !");
});

// --- Gestion Socket.IO ---
const connectedUsers = new Map(); // userId -> socket.id

io.on("connection", (socket) => {
  console.log("Socket connecté:", socket.id);

  /**
   * 1️Authentification socket : on mappe userId <-> socket.id
   */
  socket.on("authenticate", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`Utilisateur ${userId} connecté à Socket.IO`);
  });


  /**
   * 2️⃣ Rejoindre une conversation (room)
   */
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} a rejoint la room ${conversationId}`);
  });

  /**
   * 3️⃣ Envoi d’un message
   */
  socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    try {
      // Création du message
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text,
      });

      // Récupération de la conversation
      const conversation = await Chat.findById(conversationId);

      // Mise à jour du dernier message
      conversation.lastMessage = message._id;

      // Gestion des "unreadCounts"
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();

      conversation.participants.forEach((pId) => {
        if (pId.toString() !== senderId.toString()) {
          const current = conversation.unreadCounts.get(pId.toString()) || 0;
          conversation.unreadCounts.set(pId.toString(), current + 1);
        }
      });

      await conversation.save();
      await message.populate("sender", "firstName lastName avatar");

      // Émettre le message en temps réel dans la conversation
      io.to(conversationId).emit("newMessage", message);

      // Mettre à jour le compteur de non lus pour les autres utilisateurs
      conversation.participants.forEach((pId) => {
        const targetSocket = connectedUsers.get(pId.toString());
        if (targetSocket && pId.toString() !== senderId.toString()) {
          io.to(targetSocket).emit("unreadCountUpdated", {
            conversationId,
            unreadCount: conversation.unreadCounts.get(pId.toString()) || 0,
          });
        }
      });

    } catch (err) {
      console.error("❌ Erreur Socket.IO sendMessage:", err);
    }
  });

  /**
   * Marquer une conversation comme lue
   */
  socket.on("markAsRead", async ({ conversationId, userId }) => {
    try {
      const conversation = await Chat.findById(conversationId);
      if (!conversation) return;


      conversation.unreadCounts.set(userId, 0);
      await conversation.save();

      io.to(conversationId).emit("unreadCountUpdated", {
        conversationId,
        unreadCount: 0,
      });
    } catch (err) {
      console.error("Erreur Socket.IO markAsRead:", err);
    }
  });


  socket.on("disconnect", () => {
    if (socket.userId) connectedUsers.delete(socket.userId);
    console.log(`Socket ${socket.id} déconnecté`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur en cours sur http://localhost:${PORT}`);
});


export { io };
