/**
 * @swagger
 * components:
 *   schemas:
 *     Mission:
 *       type: object
 *       required:
 *         - client
 *         - titre_mission
 *         - type_intervention
 *         - niveau_risque
 *         - niveau_priorite
 *         - adresse
 *         - statut_mission
 *       properties:
 *         client:
 *           type: string
 *           description: Nom du client
 *           example: Société AlphaTech
 *         titre_mission:
 *           type: string
 *           description: Titre ou résumé de la mission
 *           example: Panne du serveur principal
 *         type_intervention:
 *           type: string
 *           enum: [Curatif, Préventif]
 *           description: Type d'intervention
 *           example: Curatif
 *         type_equipement:
 *           type: string
 *           description: Type d'équipement concerné
 *           example: Serveur HP ProLiant
 *         id_equipement:
 *           type: string
 *           description: Identifiant unique de l'équipement
 *           example: EQP-2045
 *         niveau_risque:
 *           type: string
 *           enum: [faible, moyen, élevé, critique]
 *           description: Niveau de risque lié à la mission
 *           example: élevé
 *         niveau_priorite:
 *           type: string
 *           enum: [Normal, Urgent, Critique]
 *           description: Niveau de priorité de la mission
 *           example: Urgent
 *         site_intervention:
 *           type: string
 *           description: Nom du site d’intervention
 *           example: Site Paris Sud
 *         adresse:
 *           type: string
 *           description: Adresse complète du lieu d’intervention
 *           example: 12, Rue de la Paix, 75002 Paris
 *         contact_client:
 *           type: string
 *           description: Nom du contact client sur site
 *           example: Jean Dupont
 *         telephone_contact:
 *           type: string
 *           description: Téléphone du contact sur site
 *           example: "+33 612345678"
 *         descriptif:
 *           type: string
 *           description: Description détaillée de la mission
 *           example: "Le serveur principal est à l'arrêt depuis 8h, coupure du réseau interne."
 *         materiel_remplacement_requis:
 *           type: boolean
 *           description: Indique si un remplacement de matériel est requis
 *           example: true
 *         statut_mission:
 *           type: string
 *           enum: [Disponible, Attribuée, En route, Arrivé sur site, En cours, En attente de pièces, Terminée]
 *           description: Statut actuel de la mission
 *           example: Disponible
 *         technicien_attribue:
 *           type: string
 *           description: ID du technicien assigné à la mission
 *           example: 64bfa2b5f2e4e2a1c1a5c6d2
 *         sla_capture:
 *           type: object
 *           description: Dates de suivi SLA de la mission
 *           properties:
 *             creation_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T10:15:30Z"
 *             attribution_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T11:00:00Z"
 *             en_route_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T12:00:00Z"
 *             arrivee_site_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T12:30:00Z"
 *             en_cours_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T13:00:00Z"
 *             terminee_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T14:30:00Z"
 *             rapport_soumis_date:
 *               type: string
 *               format: date-time
 *               example: "2025-11-05T15:00:00Z"
 *         rapport_intervention:
 *           type: object
 *           properties:
 *             titre:
 *               type: string
 *               example: "Remplacement disque dur"
 *             description:
 *               type: string
 *               example: "Le disque dur principal était défectueux."
 *             materiel_utilise:
 *               type: array
 *               items:
 *                 type: string
 *                 example: ["Disque dur 1TB", "Câble SATA"]
 *             resolution:
 *               type: string
 *               example: "Réinstallation complète et test réussi."
 *         createdBy:
 *           type: string
 *           description: ID de l'utilisateur ayant créé la mission
 *           example: 64bfa2b5f2e4e2a1c1a5c6d2
 */
