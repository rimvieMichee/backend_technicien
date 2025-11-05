// middlewares/roleMiddleware.js

/**
 * Middleware pour autoriser l'accès à certaines routes selon le rôle de l'utilisateur.
 *
 * @param  {...string} allowedRoles - Liste des rôles autorisés (ex: "Manager", "Technicien")
 * @returns Middleware Express
 */
export default function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        // Vérifie que l'utilisateur est authentifié
        if (!req.user) {
            return res.status(401).json({
                message: "Utilisateur non authentifié",
                code: "UNAUTHORIZED"
            });
        }

        // Vérifie que le rôle de l'utilisateur est autorisé
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Accès interdit : rôle non autorisé",
                code: "FORBIDDEN"
            });
        }

        // Si tout est OK, passe au middleware suivant
        next();
    };
}
