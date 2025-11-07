import express from "express";
import {
    createMission,
    getAllMissions,
    getMissionById,
    updateMission,
    deleteMission,
    assignMission,
    updateMissionStatus,
    getMissionsByTechnicien,
    getMissionsByTechnicienId
} from "../controller/mission.controller.js";
import authMiddleware from "../../midllewares/authMiddleware.js";
import authorizeRoles from "../../midllewares/roleMidleware.js";

const router = express.Router();

// ------------------- MANAGER ROUTES -------------------

/**
 * @swagger
 * /api/missions:
 *   post:
 *     summary: "Créer une nouvelle mission (Manager uniquement)"
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
 *                 example: "Société AlphaTech"
 *               titre_mission:
 *                 type: string
 *                 example: "Panne du serveur principal"
 *               type_intervention:
 *                 type: string
 *                 enum: [Curatif, Préventif]
 *                 example: Curatif
 *               type_equipement:
 *                 type: string
 *                 example: "Serveur HP ProLiant"
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
 *                 example: "Paris 2ème"
 *               adresse:
 *                 type: string
 *                 example: "12, Rue de la Paix, 75002 Paris"
 *               descriptif:
 *                 type: string
 *                 example: "Panne complète du serveur principal"
 *               materiel_remplacement_requis:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: "Mission créée avec succès"
 *       403:
 *         description: "Accès interdit : rôle non autorisé"
 *       500:
 *         description: "Erreur serveur"
 */
router.post("/", authMiddleware(), authorizeRoles("Manager", "Admin"), createMission);

/**
 * @swagger
 * /api/missions/{id}:
 *   put:
 *     summary: "Mettre à jour une mission (Manager uniquement)"
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
 *         description: "ID de la mission"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mission'
 *     responses:
 *       200:
 *         description: "Mission mise à jour"
 *       403:
 *         description: "Accès interdit : rôle non autorisé"
 *       500:
 *         description: "Erreur serveur"
 */
router.put("/:id", authMiddleware(), authorizeRoles("Manager", "Admin"), updateMission);

/**
 * @swagger
 * /api/missions/{id}:
 *   delete:
 *     summary: "Supprimer une mission (Manager uniquement)"
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
 *         description: "ID de la mission"
 *     responses:
 *       200:
 *         description: "Mission supprimée"
 *       403:
 *         description: "Accès interdit : rôle non autorisé"
 *       500:
 *         description: "Erreur serveur"
 */
router.delete("/:id", authMiddleware(), authorizeRoles("Manager", "Admin"), deleteMission);

// ------------------- ALL AUTHENTICATED ROUTES -------------------

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: "Obtenir la liste de toutes les missions (tous les utilisateurs authentifiés)"
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
 *         description: "Filtrer par type d'intervention"
 *       - in: query
 *         name: niveau_risque
 *         schema:
 *           type: string
 *           enum: [faible, moyen, élevé, critique]
 *         description: "Filtrer par niveau de risque"
 *       - in: query
 *         name: niveau_priorite
 *         schema:
 *           type: string
 *           enum: [Normal, Urgent, Critique]
 *         description: "Filtrer par niveau de priorité"
 *       - in: query
 *         name: statut_mission
 *         schema:
 *           type: string
 *           enum: [Disponible, En cours, En attente de pièces, Terminée]
 *         description: "Filtrer par statut"
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: "Rechercher par nom du client"
 *     responses:
 *       200:
 *         description: "Liste des missions retournée avec succès"
 *       500:
 *         description: "Erreur serveur"
 */
router.get("/", authMiddleware(), getAllMissions);

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     summary: "Obtenir une mission spécifique par son ID (tous les utilisateurs authentifiés)"
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
 *         description: "ID de la mission"
 *     responses:
 *       200:
 *         description: "Détails de la mission"
 *       404:
 *         description: "Mission non trouvée"
 *       500:
 *         description: "Erreur serveur"
 */
router.get("/:id", authMiddleware(), getMissionById);


/**
 * @swagger
 * /api/missions/technicien/{id}:
 *   get:
 *     summary: "Récupérer toutes les missions d’un technicien donné (Manager/Admin uniquement)"
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
 *         description: "ID du technicien dont on veut voir les missions"
 *     responses:
 *       200:
 *         description: "Liste des missions du technicien"
 *       403:
 *         description: "Accès interdit : rôle non autorisé"
 *       404:
 *         description: "Technicien non trouvé"
 *       500:
 *         description: "Erreur serveur"
 */
router.get(
    "/technicien/:id",
    authMiddleware(),
    authorizeRoles("Manager", "Admin"),
    getMissionsByTechnicienId
);


// ------------------- TECHNICIEN ROUTES -------------------

/**
 * @swagger
 * /api/missions/{id}/assign:
 *   post:
 *     summary: "S'attribuer une mission (Technicien uniquement)"
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
 *         description: "ID de la mission à s'attribuer"
 *     responses:
 *       200:
 *         description: "Mission attribuée avec succès"
 *       400:
 *         description: "Mission déjà attribuée"
 *       403:
 *         description: "Accès interdit : rôle non autorisé"
 *       404:
 *         description: "Mission non trouvée"
 */
router.post("/:id/assign", authMiddleware(), assignMission);

/**
 * @swagger
 * /api/missions/technicien:
 *   get:
 *     summary: "Récupérer toutes les missions attribuées au technicien connecté"
 *     tags:
 *       - Missions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Liste des missions attribuées au technicien connecté"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missions du technicien récupérées avec succès"
 *                 missions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mission'
 *       401:
 *         description: "Non authentifié - token manquant ou invalide"
 *       500:
 *         description: "Erreur serveur"
 */
router.get(
    "/technicien/missions",
    authMiddleware(),
    authorizeRoles("Technicien"),
    getMissionsByTechnicien
);


/**
 * @swagger
 * /api/missions/{id}/status:
 *   put:
 *     summary: "Mettre à jour le statut de la mission (Technicien uniquement)"
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
 *         description: "ID de la mission à mettre à jour"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut_mission
 *             properties:
 *               statut_mission:
 *                 type: string
 *                 enum: [Attribuée, En route, Arrivé sur site, En cours, Terminée]
 *                 example: En route
 *     responses:
 *       200:
 *         description: "Statut mis à jour avec succès"
 *       400:
 *         description: "Statut invalide"
 *       403:
 *         description: "Accès interdit (technicien non assigné)"
 *       404:
 *         description: "Mission non trouvée"
 */
router.put("/:id/status", authMiddleware(), updateMissionStatus);

export default router;
