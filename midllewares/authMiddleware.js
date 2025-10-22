// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import User from '../auth/model/User.js';

// dotenv.config();

// const authMiddleware = () => {
//   return async (req, res, next) => {
//     const authHeader = req.header('Authorization');
//     const token = authHeader && authHeader.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({ message: 'Accès refusé, token manquant' });
//     }


//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Récupérer l'utilisateur (sans populate)
//       const user = await User.findById(decoded._id || decoded.id);

//       if (!user) {
//         return res.status(401).json({ message: 'Utilisateur non trouvé' });
//       }

//       req.user = {
//         id: user._id,
//         role: user.role,
//         email: user.email,
//       };

//       // if (requiredRole && req.user.role !== requiredRole) {
//       //   return res.status(403).json({ message: 'Accès interdit : rôle non autorisé' });
//       // }

//       next();
//     } catch (error) {
//       // Gestion de l'expiration du token
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           message: 'Session expirée, veuillez vous reconnecter',
//           code: 'TOKEN_EXPIRED'
//         });
//       }

//       // Token invalide pour d'autres raisons
//       return res.status(403).json({
//         message: 'Token invalide',
//         error: error.message
//       });
//     }
//   };
// };

// export default authMiddleware;


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../auth/model/User.js';

dotenv.config();

const authMiddleware = () => {
  return async (req, res, next) => {
    // Récupère le token depuis le header Authorization (Bearer token)
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Accès refusé : token manquant',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Vérifie la validité du token et son expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupère l'utilisateur en base
      const user = await User.findById(decoded.id || decoded._id);
      if (!user) {
        return res.status(401).json({
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        });
      }

      // Attache les infos utilisateur à la requête
      req.user = {
        id: user._id,
        role: user.role
      };

      // Passe au middleware suivant / route
      next();

    } catch (error) {
      console.error('JWT Middleware error:', error);

      if (error.name === 'TokenExpiredError') {
        // Token expiré
        return res.status(401).json({
          message: 'Session expirée, veuillez vous reconnecter',
          code: 'TOKEN_EXPIRED'
        });
      }

      // Token invalide (mauvaise signature, format, etc.)
      return res.status(403).json({
        message: 'Token invalide',
        code: 'TOKEN_INVALID',
        error: error.message
      });
    }
  };
};

export default authMiddleware;
