import express from "express";
import {
    createMission,
    getAllMissions,
    getMissionById
} from "../controller/mission.controller.js";
import authMiddleware from "../../midllewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     tags:
 *       - Missions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client
 *               - adresse
 *               - type_intervention
 *               - niveau_risque
 *               - niveau_priorite
 *             properties:
 *               client:
 *                 type: string
 *                 example: Société AlphaTech
 *               titre_mission:
 *                 type: string
 *                 example: Panne du serveur principal
 *               type_intervention:
 *                 type: string
 *                 enum: [Curatif, Préventif]
 *                 example: Curatif
 *               type_equipement:
 *                 type: string
 *                 example: Serveur HP ProLiant
 *               id_equipement:
 *                 type: string
 *                 example: M-101A
 *               niveau_risque:
 *                 type: string
 *                 enum: [faible, moyen, élevé, critique]
 *                 example: critique
 *               niveau_priorite:
 *                 type: string
 *                 enum: [Normal, Urgent, Critique]
 *                 example: Urgent
 *               site_intervention:
 *                 type: string
 *                 example: Paris 2ème
 *               adresse:
 *                 type: string
 *                 example: 12, Rue de la Paix, 75002 Paris
 *               descriptif:
 *                 type: string
 *                 example: Panne complète du serveur principal dans la salle 204.
 *               materiel_remplacement_requis:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Mission créée avec succès
 *       400:
 *         description: Erreur lors de la création
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware(), createMission);

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: Obtenir la liste de toutes les missions (avec filtres optionnels)
 *     tags:
 *       - Missions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type_intervention
 *         schema:
 *           type: string
 *           enum: [Curatif, Préventif]
 *         description: Filtrer par type d'intervention
 *       - in: query
 *         name: niveau_risque
 *         schema:
 *           type: string
 *           enum: [faible, moyen, élevé, critique]
 *         description: Filtrer par niveau de risque
 *       - in: query
 *         name: niveau_priorite
 *         schema:
 *           type: string
 *           enum: [Normal, Urgent, Critique]
 *         description: Filtrer par niveau de priorité
 *       - in: query
 *         name: statut_mission
 *         schema:
 *           type: string
 *           enum: [Disponible, En cours, En attente de pièces, Terminée]
 *         description: Filtrer par statut
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Rechercher par nom du client
 *     responses:
 *       200:
 *         description: Liste des missions retournée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware(), getAllMissions);

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     summary: Obtenir une mission spécifique par son ID
 *     tags:
 *       - Missions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Détails de la mission
 *       404:
 *         description: Mission non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", authMiddleware(), getMissionById);


export default router;
