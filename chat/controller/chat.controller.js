import Conversation from "../../chat/model/Chat.js";
import Message from "../model/Message.js";
import User from "../../auth/model/User.js";
import {createNotification} from "../../notification/utils/notify.js";
import {sendPushNotification} from "../../config/fcm.js";

/**
 * Créer une conversation entre deux utilisateurs (private chat)
 */
export const createChat = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id; // correction ici

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
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });
        await Chat.findByIdAndUpdate(conversationId, { lastMessage: message._id });
        req.io.to(conversationId).emit("newMessage", message);

        // ====== Notification au destinataire ======
        // Récupérer la conversation avec participants
        let chat = await Chat.findById(conversationId).populate(
            "participants",
            "_id firstName deviceTokens"
        );
        if (!chat) {
            console.warn("Conversation non trouvée pour la notification:", conversationId);
        } else {
            let recipient = chat.participants.find(
                p => p._id.toString() !== senderId.toString()
            );
            if (!recipient) {
                const recipientId = chat.participants.find(
                    p => p.toString() !== senderId.toString()
                );
                if (recipientId) recipient = await User.findById(recipientId);
            }
            if (!recipient) {
                console.warn("Destinataire introuvable pour la notification, conversationId:", conversationId);
            } else {
                const senderUser = await User.findById(senderId); // Récupérer infos de l'expéditeur
                const senderName = senderUser?.firstName || "Un utilisateur";
                const notifMessage = `Nouveau message de ${senderName} : "${text}"`;
                try {
                    await createNotification(
                        recipient._id,
                        "Nouveau message",
                        notifMessage,
                        "Message",
                        conversationId,
                        "important"
                    );
                    console.log("Notification créée en DB pour:", recipient._id);
                } catch (notifErr) {
                    console.error("Erreur création notification en DB:", notifErr);
                }
                try {
                    req.io.to(recipient._id.toString()).emit("notification", {
                        title: "Nouveau message",
                        message: notifMessage,
                        conversationId,
                    });
                    console.log("Notification Socket.IO envoyée à:", recipient._id);
                } catch (socketErr) {
                    console.error("Erreur envoi notification Socket.IO:", socketErr);
                }
                if (recipient.deviceTokens?.length > 0) {
                    try {
                        await sendPushNotification(
                            recipient.deviceTokens,
                            "Nouveau message",
                            notifMessage,
                            { conversationId }
                        );
                        console.log("Push notification envoyée à:", recipient._id);
                    } catch (pushErr) {
                        console.error("Erreur push notification:", pushErr);
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
        const userId = req.user.id;

        // Vérifie que le userId est bien passé
        console.log("User connecté:", userId);

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "firstName lastName email role")
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        console.error("Erreur getChats:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
