import Conversation from "../../chat/model/Chat.js"; // ton modèle Conversation
import Message from "../model/Message.js";
import User from "../../auth/model/User.js";
import { createNotification } from "../../notification/utils/notify.js";
import { sendPushNotification } from "../../config/fcm.js";

/**
 * Créer une conversation privée entre deux utilisateurs
 */
export const createChat = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id;

        // Vérifie si la conversation existe déjà
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, participantId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, participantId],
            });
        }

        res.status(201).json(conversation);
    } catch (err) {
        console.error("Erreur createChat:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/**
 * Envoyer un message dans une conversation
 */
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { conversationId } = req.params;
        const senderId = req.user.id;

        // Crée le message
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });

        // Optionnel : mettre à jour la conversation avec le dernier message
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

        // Émettre via Socket.IO
        if (req.io) req.io.to(conversationId).emit("newMessage", message);

        // Notifications pour le destinataire
        const conversation = await Conversation.findById(conversationId).populate(
            "participants",
            "_id firstName deviceTokens"
        );

        if (conversation) {
            // Destinataire = celui qui n'a pas envoyé le message
            let recipient = conversation.participants.find(
                (p) => p._id.toString() !== senderId.toString()
            );

            if (recipient) {
                const senderUser = await User.findById(senderId);
                const senderName = senderUser?.firstName || "Un utilisateur";
                const notifMessage = `Nouveau message de ${senderName} : "${text}"`;

                // DB notification
                try {
                    await createNotification(
                        recipient._id,
                        "Nouveau message",
                        notifMessage,
                        "Message",
                        conversationId,
                        "important"
                    );
                } catch (err) {
                    console.error("Erreur création notification DB:", err);
                }

                // Socket.IO
                try {
                    if (req.io) {
                        req.io.to(recipient._id.toString()).emit("notification", {
                            title: "Nouveau message",
                            message: notifMessage,
                            conversationId,
                        });
                    }
                } catch (err) {
                    console.error("Erreur Socket.IO notification:", err);
                }

                // Push notification
                if (recipient.deviceTokens?.length > 0) {
                    try {
                        await sendPushNotification(
                            recipient.deviceTokens,
                            "Nouveau message",
                            notifMessage,
                            { conversationId }
                        );
                    } catch (err) {
                        console.error("Erreur push notification:", err);
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
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/**
 * Récupérer toutes les conversations d'un utilisateur
 */
export const getChats = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("User connecté:", userId);

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "firstName lastName email role")
            .sort({ updatedAt: -1 }); // timestamps doivent être activés

        res.status(200).json(conversations);
    } catch (err) {
        console.error("Erreur getChats:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
