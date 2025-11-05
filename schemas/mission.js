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
 *           description: Type d'intervention
 *           enum: [Curatif, Préventif]
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
 *           description: Niveau de risque lié à la mission
 *           enum: [faible, moyen, élevé, critique]
 *           example: élevé
 *         niveau_priorite:
 *           type: string
 *           description: Niveau de priorité de la mission
 *           enum: [Normal, Urgent, Critique]
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
 *           example: "Le serveur principal est à l'arrêt depuis 8h du matin, provoquant une coupure du réseau interne."
 *         materiel_remplacement_requis:
 *           type: boolean
 *           description: Indique si un remplacement de matériel est requis
 *           example: true
 *         date_creation:
 *           type: string
 *           format: date-time
 *           description: Date de création de la mission
 *           example: "2025-11-05T10:15:30Z"
 *         date_echeance:
 *           type: string
 *           format: date-time
 *           description: Date limite prévue pour la mission
 *           example: "2025-11-06T17:00:00Z"
 *         statut_mission:
 *           type: string
 *           description: Statut actuel de la mission
 *           enum: [Disponible, En route, Arrivé sur site, En cours, En attente de pièces, Terminée]
 *           example: Disponible
 *         technicien_attribue:
 *           type: string
 *           description: ID du technicien assigné à la mission
 *           example: 64bfa2b5f2e4e2a1c1a5c6d2
 *         photos:
 *           type: array
 *           description: Liste des URLs des photos prises durant l’intervention
 *           items:
 *             type: string
 *             example: https://cloudinary.com/image123.jpg
 *         signature_client:
 *           type: string
 *           description: Lien vers l’image de la signature du client
 *           example: https://cloudinary.com/signature123.png
 *         commentaire_technicien:
 *           type: string
 *           description: Commentaire ou rapport du technicien
 *           example: "Remplacement du disque dur et redémarrage réussi du serveur."
 *         resolution_statut:
 *           type: string
 *           description: Statut de résolution de la mission
 *           enum: [Résolu, Non résolu, En attente de pièces]
 *           example: Résolu
 *         synchronise:
 *           type: boolean
 *           description: Statut de synchronisation de la mission (utile pour le mode hors-ligne)
 *           example: true
 */
