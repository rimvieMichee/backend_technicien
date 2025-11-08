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
        const senderId = req.user.id;

        // Créer le message
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });

        // Mettre à jour le dernier message dans la conversation
        await Chat.findByIdAndUpdate(conversationId, { lastMessage: message._id });

        // Émettre le message à tous les participants via Socket.IO
        req.io.to(conversationId).emit("newMessage", message);

        // ====== Notification au destinataire ======
        // Récupérer la conversation avec participants
        const chat = await Chat.findById(conversationId).populate(
            "participants",
            "_id firstName deviceTokens"
        );

        if (!chat) {
            console.warn("Conversation non trouvée pour la notification:", conversationId);
        } else {
            // Destinataire = participant qui n'est pas l'expéditeur
            const recipient = chat.participants.find(p => p._id.toString() !== senderId);
            if (!recipient) {
                console.warn("Destinataire introuvable pour la notification, conversationId:", conversationId);
            } else {
                const senderName = req.user.firstName || "Un utilisateur";
                const notifMessage = `Nouveau message de ${senderName} : "${text}"`;

                // Créer la notification en base
                try {
                    await createNotification(
                        recipient._id,
                        "Nouveau message",
                        notifMessage,
                        "Chat",
                        conversationId
                    );
                } catch (notifErr) {
                    console.error("Erreur création notification en DB:", notifErr);
                }

                // Émettre notification en temps réel via Socket.IO
                try {
                    req.io.to(recipient._id.toString()).emit("notification", {
                        title: "Nouveau message",
                        message: notifMessage,
                        conversationId,
                    });
                } catch (socketErr) {
                    console.error("Erreur envoi notification via Socket.IO:", socketErr);
                }

                // Envoi push si deviceTokens définis
                if (recipient.deviceTokens?.length > 0) {
                    try {
                        await sendPushNotification(
                            recipient.deviceTokens,
                            "Nouveau message",
                            notifMessage,
                            { conversationId }
                        );
                    } catch (pushErr) {
                        console.error("Erreur envoi push notification:", pushErr);
                    }
                }
            }
        }

        res.status(201).json(message);
    } catch (err) {
        console.error("Erreur sendMessage:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
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
