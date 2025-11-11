import Conversation from "../../chat/model/Chat.js";
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

        let conversation = await Conversation.findOne({
            participants: { $all: [userId, participantId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, participantId],
                unreadCounts: {
                    [userId]: 0,
                    [participantId]: 0,
                },
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

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });

        let conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation introuvable" });
        }

        // ✅ Met à jour le dernier message
        conversation.lastMessage = message._id;

        // ✅ Incrémente les non lus pour les autres participants
        conversation.participants.forEach((userId) => {
            const id = userId.toString();
            if (id !== senderId.toString()) {
                const current = conversation.unreadCounts.get(id) || 0;
                conversation.unreadCounts.set(id, current + 1);
            }
        });

        await conversation.save();

        await message.populate("sender", "firstName lastName avatar");

        // 🔔 Envoi socket du nouveau message
        if (req.io) req.io.to(conversationId).emit("newMessage", message);

        // 🔔 Notification / Push
        const fullConversation = await Conversation.findById(conversationId).populate(
            "participants",
            "_id firstName lastName deviceTokens"
        );

        if (fullConversation) {
            const recipient = fullConversation.participants.find(
                (p) => p._id.toString() !== senderId.toString()
            );

            if (recipient) {
                const senderName = message.sender.firstName || "Un utilisateur";
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
                } catch (err) {
                    console.error("Erreur création notification DB:", err);
                }

                // Socket notification
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
 * ✅ Marquer les messages comme lus (quand un utilisateur ouvre la conversation)
 */
export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation introuvable" });
        }

        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();

        if (req.io) {
            req.io.to(conversationId).emit("messagesRead", {
                conversationId,
                userId,
            });
        }

        res.json({ success: true, message: "Messages marqués comme lus." });
    } catch (err) {
        console.error("Erreur markAsRead:", err);
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
            .populate("sender", "firstName lastName email avatar")
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

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "firstName lastName email role avatar")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "firstName lastName" },
            })
            .sort({ updatedAt: -1 })
            .lean();

        // ✅ Ajoute le compteur non lu spécifique à cet utilisateur
        const formatted = conversations.map((conv) => ({
            ...conv,
            unreadCount: conv.unreadCounts?.[userId] || 0,
        }));

        res.status(200).json(formatted);
    } catch (err) {
        console.error("Erreur getChats:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/**
 * Editer un message (uniquement par son auteur)
 */
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message introuvable" });
        if (message.sender.toString() !== userId.toString())
            return res.status(403).json({ message: "Non autorisé" });

        message.text = text;
        message.edited = true;
        await message.save();

        if (req.io) {
            req.io.to(message.conversation.toString()).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (err) {
        console.error("Erreur editMessage:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/**
 * Supprimer un message (uniquement par son auteur)
 */
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message introuvable" });
        if (message.sender.toString() !== userId.toString())
            return res.status(403).json({ message: "Non autorisé" });

        await message.deleteOne();

        const conversation = await Conversation.findById(message.conversation);
        if (conversation?.lastMessage?.toString() === message._id.toString()) {
            const lastMsg = await Message.findOne({ conversation: conversation._id }).sort({
                createdAt: -1,
            });
            conversation.lastMessage = lastMsg ? lastMsg._id : null;
            await conversation.save();
        }

        if (req.io) {
            req.io.to(message.conversation.toString()).emit("messageDeleted", {
                messageId: message._id,
                conversationId: message.conversation,
            });
        }

        res.status(200).json({ message: "Message supprimé avec succès." });
    } catch (err) {
        console.error("Erreur deleteMessage:", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
