/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - conversation
 *         - sender
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           example: 64fcae12e9b2f43b8a9d2a0a
 *         conversation:
 *           type: string
 *           description: ID de la conversation
 *           example: 64fcae12e9b2f43b8a9d2a0b
 *         sender:
 *           type: string
 *           description: ID de l'utilisateur qui envoie le message
 *           example: 64fcae12e9b2f43b8a9d2a0c
 *         text:
 *           type: string
 *           description: Contenu du message
 *           example: "Bonjour, avez-vous terminé la mission ?"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Chat:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         id:
 *           type: string
 *           example: 64fcae12e9b2f43b8a9d2a0d
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             description: ID d'un utilisateur
 *           example: ["64fcae12e9b2f43b8a9d2a0c", "64fcae12e9b2f43b8a9d2a0e"]
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         subject:
 *           type: string
 *           example: "Discussion Mission #123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
