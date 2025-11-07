import express from "express";
import {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getProfile,
    getUserById,
    registerDeviceToken,
    resetPasswordWithOTP,
    sendPasswordResetOTP,
    logoutUser
} from "../controller/user.controller.js";
import authMiddleware from "../../midllewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - departement
 *         - post
 *         - phone
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           example: 64fcae12e9b2f43b8a9d2a0a
 *         firstName:
 *           type: string
 *           example: Cedric
 *         lastName:
 *           type: string
 *           example: KONTOGOM
 *         email:
 *           type: string
 *           format: email
 *           example: cedric.kontogom@sahelys.com
 *         password:
 *           type: string
 *           format: password
 *           example: Cedric123
 *         departement:
 *           type: string
 *           example: IT
 *         post:
 *           type: string
 *           example: Technicien réseau
 *         phone:
 *           type: string
 *           example: "06606060"
 *         Avatar:
 *           type: string
 *           example: https://example.com/avatar.jpg
 *         role:
 *           type: string
 *           enum: ["Technicien", "Manager", "Admin"]
 *           example: "Technicien"
 *         deviceTokens:
 *           type: array
 *           items:
 *             type: string
 *           example: ["fcm_token_123", "fcm_token_456"]
 *       example:
 *         firstName: Cedric
 *         lastName: KONTOGOM
 *         email: cedric.kontogom@sahelys.com
 *         password: Cedric123
 *         departement: IT
 *         post: Technicien réseau
 *         phone: "06606060"
 *         role: Technicien
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: L'utilisateur existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 description: Email ou numéro de téléphone
 *                 example: cedric.kontogom@sahelys.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Cedric123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Identifiants invalides
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Envoyer un code OTP par e-mail pour réinitialiser le mot de passe
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cedric.kontogom@sahelys.com
 *     responses:
 *       200:
 *         description: Code OTP envoyé par e-mail
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post("/forgot-password", sendPasswordResetOTP);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec un code OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cedric.kontogom@sahelys.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NouveauMotDePasse123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Code OTP invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
router.post("/reset-password", resetPasswordWithOTP);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Déconnecter un utilisateur (supprime le token d'appareil)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM de l'appareil à retirer
 *                 example: "fcm_token_123"
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post("/logout", authMiddleware(), logoutUser);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   get:
 *     summary: Obtenir le profil d’un utilisateur par ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur introuvable
 */
router.get("/profile/:id", authMiddleware(), getProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste paginée et filtrée des utilisateurs
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: ["Technicien", "Manager", "Admin"]
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *           description: Recherche par nom, email ou téléphone
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware(), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur par son ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", authMiddleware(), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur par ID
 *     tags:
 *       - Users
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
 *         description: Utilisateur supprimé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware(), deleteUser);

/**
 * @swagger
 * /api/users/device-token:
 *   post:
 *     summary: Enregistrer le token FCM d’un appareil pour recevoir des notifications push
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM de l’appareil
 *                 example: "fcm_token_abc123"
 *     responses:
 *       200:
 *         description: Token enregistré avec succès
 *       400:
 *         description: Token manquant
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post("/device-token", authMiddleware(), registerDeviceToken);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags:
 *       - Users
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
 *         description: Données utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/:id", authMiddleware(), getUserById);

export default router;
