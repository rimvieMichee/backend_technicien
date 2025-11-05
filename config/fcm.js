// config/fcm.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Lecture du JSON depuis la variable d'environnement
let serviceAccount;
try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT non défini dans le .env !");
    }
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} catch (err) {
    console.error("❌ Impossible de parser FIREBASE_SERVICE_ACCOUNT :", err.message);
    process.exit(1);
}

// 🔹 Initialisation Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialisé avec succès !");
} catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin :", error);
    process.exit(1);
}

/**
 * Envoi d'une notification push à un ou plusieurs appareils
 * @param {string|string[]} deviceTokens - Token(s) FCM du ou des appareils
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @param {object} data - Données personnalisées optionnelles
 */
export const sendPushNotification = async (deviceTokens, title, body, data = {}) => {
    if (!deviceTokens || (Array.isArray(deviceTokens) && deviceTokens.length === 0)) {
        return { successCount: 0, failureCount: 0 };
    }

    const message = {
        notification: { title, body },
        data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        tokens: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens],
    };

    try {
        const response = await admin.messaging().sendMulticast(message);

        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) console.error(`❌ Échec notification pour token ${message.tokens[idx]}:`, resp.error);
            });
        }

        return { successCount: response.successCount, failureCount: response.failureCount };
    } catch (err) {
        console.error("🚨 Erreur lors de l'envoi de notification:", err);
        return { successCount: 0, failureCount: message.tokens.length };
    }
};

export default admin;
