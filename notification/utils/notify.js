import Notification from "../model/Notification.js";

/**
 * Crée une notification dans la base.
 * @param {ObjectId} recipient - ID de l'utilisateur destinataire
 * @param {String} title - Titre de la notification
 * @param {String} message - Message de la notification
 * @param {String} [type] - Type de notification (Mission, System, etc.)
 * @param {ObjectId} [relatedId] - ID lié à la notification (ex: mission)
 */
export async function createNotification(recipient, title, message, type = "Mission", relatedId = null) {
    try {
        const notification = await Notification.create({
            recipient,
            title,
            message,
            type,
            relatedId,
        });
        console.log(`Notification envoyée à ${recipient}: ${title}`);
        return notification;
    } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
    }
}
