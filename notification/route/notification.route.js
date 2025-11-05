import express from "express";
import Notification from "../model/Notification.js";
import authMiddleware from "../../midllewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get("/", authMiddleware(), async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du chargement des notifications" });
    }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.put("/:id/read", authMiddleware(), async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification)
            return res.status(404).json({ message: "Notification non trouvée" });

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la notification" });
    }
});

export default router;
