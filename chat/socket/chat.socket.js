import Conversation from "../model/Chat.js";
import Message from "../model/Message.js";

const connectedUsers = new Map(); // Map(userId -> socketId)

export default function chatSocketHandler(io, socket) {
    console.log("📡 Client connecté:", socket.id);

    /**
     * 🧠 1️⃣ L'utilisateur s'identifie après connexion
     */
    socket.on("authenticate", (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ Utilisateur ${userId} connecté au socket.`);
    });

    /**
     * 💬 2️⃣ L'utilisateur rejoint une conversation
     */
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`📨 Utilisateur ${socket.userId} a rejoint la conversation ${conversationId}`);
    });

    /**
     * 📨 3️⃣ Lorsqu'un message est envoyé
     */
    socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
        try {
            // Création du message
            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                text,
            });

            // Mise à jour du dernier message
            const conversation = await Conversation.findById(conversationId);
            conversation.lastMessage = message._id;

            // Incrément du compteur non lu pour les autres participants
            conversation.participants.forEach((pId) => {
                if (pId.toString() !== senderId.toString()) {
                    conversation.unreadCounts.set(
                        pId.toString(),
                        (conversation.unreadCounts.get(pId.toString()) || 0) + 1
                    );
                }
            });

            await conversation.save();

            await message.populate("sender", "firstName lastName avatar");

            // Émettre le message à tous les participants connectés
            io.to(conversationId).emit("newMessage", {
                conversationId,
                message,
            });

            // Émettre la mise à jour du compteur non lu
            conversation.participants.forEach((pId) => {
                const targetSocketId = connectedUsers.get(pId.toString());
                if (targetSocketId && pId.toString() !== senderId.toString()) {
                    io.to(targetSocketId).emit("unreadCountUpdated", {
                        conversationId,
                        unreadCount: conversation.unreadCounts.get(pId.toString()) || 0,
                    });
                }
            });

        } catch (err) {
            console.error("❌ Erreur sendMessage socket:", err);
        }
    });

    /**
     * 👁️‍🗨️ 4️⃣ Marquer les messages d'une conversation comme lus
     */
    socket.on("markAsRead", async ({ conversationId, userId }) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            // Réinitialiser le compteur pour cet utilisateur
            conversation.unreadCounts.set(userId, 0);
            await conversation.save();

            // Émettre la mise à jour du compteur au front
            io.to(conversationId).emit("unreadCountUpdated", {
                conversationId,
                unreadCount: 0,
            });
        } catch (err) {
            console.error("❌ Erreur markAsRead socket:", err);
        }
    });

    /**
     * 🚪 5️⃣ Déconnexion
     */
    socket.on("disconnect", () => {
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            console.log(`🔴 Utilisateur ${socket.userId} déconnecté.`);
        }
    });
}
