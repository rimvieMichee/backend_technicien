import Chat from "../model/Chat.js";
import Message from "../model/Message.js";
import User from "../../auth/model/User.js";

/**
 * Créer une conversation entre deux utilisateurs (private chat)
 */
export const createChat = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id; // ✅ correction ici

        // Vérifier si une conversation existe déjà entre ces deux utilisateurs
        let chat = await Chat.findOne({
            type: "private",
            participants: { $all: [userId, participantId] },
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [userId, participantId],
                type: "private",
            });
        }

        res.status(201).json(chat);
    } catch (err) {
        console.error("Erreur createChat:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Envoyer un message
 */
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { conversationId } = req.params;
        const sender = req.user.id;

        const message = await Message.create({
            conversation: conversationId,
            sender,
            text,
        });

        await Chat.findByIdAndUpdate(conversationId, { lastMessage: message._id });

        req.io.to(conversationId).emit("newMessage", message);

        res.status(201).json(message);
    } catch (err) {
        console.error("Erreur sendMessage:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


/**
 * Récupérer tous les messages d'une conversation
 */
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "firstName lastName email")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error("Erreur getMessages:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Récupérer toutes les conversations d'un utilisateur
 */
export const getChats = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ correction ici aussi

        const chats = await Chat.find({ participants: userId })
            .populate("participants", "firstName lastName email role")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (err) {
        console.error("Erreur getChats:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
