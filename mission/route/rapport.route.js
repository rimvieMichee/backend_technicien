import express from "express";
import {
    submitRapport,
    viewRapport,
    validateRapport
} from "../controller/mission.controller.js";
import authMiddleware from "../../midllewares/authMiddleware.js";
import authorizeRoles from "../../midllewares/roleMidleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/rapports/{id}:
 *   put:
 *     summary: "Soumettre ou mettre à jour le rapport d'une mission (Technicien uniquement)"
 *     tags:
 *       - Rapports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID de la mission"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - travail_effectue
 *               - statut_resolution
 *               - prochaine_etape
 *               - signature_client
 *             properties:
 *               travail_effectue:
 *                 type: string
 *                 example: "Remplacement ventilateur"
 *               statut_resolution:
 *                 type: string
 *                 enum: [resolu, partiellement resolu, non resolu, en attente de pièce]
 *                 example: resolu
 *               prochaine_etape:
 *                 type: string
 *                 example: "Vérification dans 1 semaine"
 *               materiel_utilise:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom:
 *                       type: string
 *                     quantite:
 *                       type: number
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               signature_client:
 *                 type: string
 *                 example: "https://serveur.com/signature.png"
 *               notes_additionnelles:
 *                 type: string
 *                 example: "Tout fonctionne correctement"
 *     responses:
 *       200:
 *         description: "Rapport soumis avec succès"
 *       403:
 *         description: "Non autorisé"
 *       404:
 *         description: "Mission non trouvée"
 */
router.put("/:id", authMiddleware(), authorizeRoles("Technicien"), submitRapport);

/**
 * @swagger
 * /api/rapports/{id}:
 *   get:
 *     summary: "Consulter le rapport d'une mission (Manager/Admin uniquement)"
 *     tags:
 *       - Rapports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID de la mission"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Rapport récupéré avec succès"
 *       404:
 *         description: "Mission non trouvée"
 */
router.get("/:id", authMiddleware(), authorizeRoles("Manager", "Admin"), viewRapport);

/**
 * @swagger
 * /api/rapports/{id}/valider:
 *   post:
 *     summary: "Valider le rapport d'une mission (Manager/Admin uniquement)"
 *     tags:
 *       - Rapports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID de la mission"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Rapport validé avec succès"
 *       404:
 *         description: "Mission non trouvée"
 */
router.post("/:id/valider", authMiddleware(), authorizeRoles("Manager", "Admin"), validateRapport);

export default router;
