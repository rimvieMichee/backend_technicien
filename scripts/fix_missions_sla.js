// scripts/fix_missions_sla.js
import mongoose from "mongoose";
import Mission from "../mission/model/Mission.js";
import dotenv from "dotenv";

dotenv.config();

const runFix = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connecté à MongoDB");

        // 🩺 Trouver toutes les missions sans sla_capture
        const missions = await Mission.find({
            $or: [
                { sla_capture: { $exists: false } },
                { sla_capture: null }
            ]
        });

        console.log(`🧾 ${missions.length} missions à corriger`);

        for (const mission of missions) {
            mission.sla_capture = {
                attribution_date: null,
                en_route_date: null,
                arrivee_site_date: null,
                en_cours_date: null,
                terminee_date: null,
            };
            await mission.save();
            console.log(`Mission ${mission._id} corrigée`);
        }

        console.log("🎉 Correction terminée !");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la correction :", error);
        process.exit(1);
    }
};

runFix();
