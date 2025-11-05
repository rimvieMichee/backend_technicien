// middlewares/roleMiddleware.js

/**
 * Middleware pour autoriser l'accès à certaines routes selon le rôle de l'utilisateur.
 * Comparaison insensible à la casse.
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
                code: "UNAUTHORIZED",
            });
        }

        // Normalise les rôles (insensible à la casse)
        const userRole = req.user.role?.toLowerCase();
        const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

        // Vérifie que le rôle est autorisé
        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Accès interdit : rôle non autorisé",
                code: "FORBIDDEN",
                details: {
                    userRole: req.user.role,
                    allowed: allowedRoles,
                },
            });
        }

        // Si tout est OK, passe au middleware suivant
        next();
    };
}
