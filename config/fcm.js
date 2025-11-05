// config/fcm.js
import admin from "firebase-admin";
import { join } from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Chemin vers le fichier serviceAccountKey.json
const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    join(process.cwd(), "config", "serviceAccountKey.json");

// 🔹 Lecture et parsing du fichier JSON
let serviceAccount;
try {
    const fileData = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileData);
} catch (err) {
    console.error("❌ Impossible de lire serviceAccountKey.json :", err.message);
    process.exit(1);
}

// 🔹 Initialisation Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialisé avec succès !");
} catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin:", error);
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
    if (!deviceTokens || (Array.isArray(deviceTokens) && deviceTokens.length === 0)) return;

    const message = {
        notification: { title, body },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK", // nécessaire pour Flutter
        },
        tokens: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens],
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log(`📱 Notifications envoyées : ${response.successCount} succès, ${response.failureCount} échecs`);

        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success)
                    console.error(`❌ Échec notification pour token ${message.tokens[idx]}:`, resp.error);
            });
        }
    } catch (err) {
        console.error("🚨 Erreur lors de l'envoi de notification:", err);
    }
};

export default admin;
