// scripts/updateNotificationTags.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "../notification/model/Notification.js";

// Charger les variables d'environnement (si tu utilises .env)
dotenv.config();

// ✅ Connexion à MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/tonDB"; // adapte le nom de ta base

await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

console.log("✅ Connecté à MongoDB");

try {
    // Sélectionner les notifications sans tag
    const notifications = await Notification.find({ $or: [{ tag: { $exists: false } }, { tag: null }] });
    console.log(`🔍 ${notifications.length} notifications sans tag trouvées.`);

    for (const notif of notifications) {
        let tag = "info"; // valeur par défaut

        // Appliquer la logique selon le type
        switch (notif.type) {
            case "Mission":
                tag = "important";
                break;
            case "Rapport":
                tag = "info";
                break;
            case "Message":
                tag = "important";
                break;
            default:
                tag = "info";
        }

        notif.tag = tag;
        await notif.save();
        console.log(`✅ Notification ${notif._id} mise à jour avec tag="${tag}"`);
    }

    console.log("🎉 Migration terminée !");
} catch (err) {
    console.error("❌ Erreur lors de la migration :", err);
} finally {
    mongoose.connection.close();
    console.log("🔒 Connexion MongoDB fermée.");
}
