import express from "express";
import authMiddleware from "../../midllewares/authMiddleware.js";
import {
    createChat,
    sendMessage,
    getMessages,
    getChats,
    editMessage,
    deleteMessage
} from "../controller/chat.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         id:
 *           type: string
 *           example: 64fdc3b8e9a12345abcd6789
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             description: ID d'utilisateur
 *           example: ["64fdc3b8e9a12345abcd6789", "64fdc3b8e9a12345abcd6790"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-05T12:34:56.789Z"
 *     Message:
 *       type: object
 *       required:
 *         - conversation
 *         - sender
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           example: 64fdc4dfe9a12345abcd6791
 *         conversation:
 *           type: string
 *           example: 64fdc3b8e9a12345abcd6789
 *         sender:
 *           type: string
 *           example: 64fdc3b8e9a12345abcd6789
 *         text:
 *           type: string
 *           example: "Bonjour, la machine est réparée."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-05T12:35:56.789Z"
 *         read:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Créer une conversation entre deux utilisateurs
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID de l'autre utilisateur
 *                 example: "64fdc3b8e9a12345abcd6789"
 *     responses:
 *       201:
 *         description: Conversation créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware(), createChat);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Récupérer toutes les conversations de l'utilisateur connecté
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware(), getChats);

/**
 * @swagger
 * /api/chat/{conversationId}:
 *   post:
 *     summary: Envoyer un message dans une conversation
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Bonjour, est-ce que vous êtes disponible pour la maintenance ?"
 *     responses:
 *       201:
 *         description: Message envoyé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur serveur
 */
router.post("/:conversationId", authMiddleware(), sendMessage);


/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   put:
 *     summary: Modifier un message (uniquement par son auteur)
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Message mis à jour"
 *     responses:
 *       200:
 *         description: Message modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       403:
 *         description: Accès refusé (non auteur du message)
 *       404:
 *         description: Message introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/message/:messageId", authMiddleware(), editMessage);



/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   delete:
 *     summary: Supprimer un message (uniquement par son auteur)
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message à supprimer
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       403:
 *         description: Accès refusé (non auteur du message)
 *       404:
 *         description: Message introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/message/:messageId", authMiddleware(), deleteMessage);



/**
 * @swagger
 * /api/chat/{conversationId}:
 *   get:
 *     summary: Récupérer les messages d'une conversation
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversation
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur serveur
 */
router.get("/:conversationId", authMiddleware(), getMessages);

export default router;
