// mission/controller/mission.controller.js
import Mission from "../model/Mission.js";
import User from "../../auth/model/User.js";
import { createNotification } from "../../notification/utils/notify.js";
import { sendPushNotification } from "../../config/fcm.js";
import {populate} from "dotenv";

// --------------------
// 🟢 Créer une mission (Manager)
// --------------------
export const createMission = async (req, res) => {
    try {
        const missionData = req.body;

        if (!missionData.idMission) {
            const count = await Mission.countDocuments();
            missionData.idMission = `M-${String(count + 1).padStart(3, "0")}-2025`;
        }

        missionData.createdBy = req.user.id;
        const mission = await Mission.create(missionData);

        // Notifier tous les techniciens
        const technicians = await User.find({ role: "Technicien" });
        for (const tech of technicians) {
            const notifMessage = `Une nouvelle mission "${mission.titre_mission}" a été créée.`;

            // DB
            await createNotification(tech._id, "Nouvelle mission disponible", notifMessage, "Mission", mission._id);

            // Socket.IO
            req.io.to(tech._id.toString()).emit("notification", {
                title: "Nouvelle mission disponible",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            // FCM push
            if (tech.deviceTokens?.length > 0) {
                await sendPushNotification(
                    tech.deviceTokens,
                    "Nouvelle mission disponible",
                    notifMessage,
                    { missionId: mission._id.toString() }
                );
            }
        }

        res.status(201).json({ message: "Mission créée avec succès", mission });
    } catch (error) {
        console.error("Erreur création mission:", error);
        res.status(400).json({ message: "Erreur lors de la création de la mission", error: error.message });
    }
};

// --------------------
// 🟡 Récupérer toutes les missions
// --------------------


export const getAllMissions = async (req, res) => {
    try {
        const missions = await Mission.find()
            .populate("createdBy", "firstName lastName phone") // 👈 ici on précise les champs à inclure
            .populate("technicien_attribue", "firstName lastName phone"); // (optionnel)

        res.status(200).json(missions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des missions", error });
    }
};


// --------------------
// 🟢 Récupérer une mission par ID
// --------------------
export const getMissionById = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id)
            .populate("createdBy", "firstName lastName phone")
            .populate("technicien_attribue", "firstName lastName phone");

        if (!mission) {
            return res.status(404).json({ message: "Mission non trouvée" });
        }

        res.status(200).json(mission);
    } catch (error) {
        console.error("Erreur getMissionById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// --------------------
// 🟢 Mettre à jour une mission (Manager)
// --------------------
export const updateMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        // Notifier le technicien attribué
        if (mission.technicien_attribue) {
            const tech = await User.findById(mission.technicien_attribue);
            const notifMessage = `Les détails de la mission "${mission.titre_mission}" ont été modifiés.`;

            await createNotification(tech._id, "Mise à jour de votre mission", notifMessage, "Mission", mission._id);
            req.io.to(tech._id.toString()).emit("notification", {
                title: "Mise à jour de mission",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            if (tech.deviceTokens?.length > 0) {
                await sendPushNotification(tech.deviceTokens, "Mise à jour de mission", notifMessage, { missionId: mission._id.toString() });
            }
        }

        res.status(200).json({ message: "Mission mise à jour", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

// --------------------
// Supprimer une mission
// --------------------
export const deleteMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.status(200).json({ message: "Mission supprimée", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// --------------------
// Technicien s’attribue une mission
// --------------------
export const assignMission = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        if (mission.technicien_attribue) return res.status(400).json({ message: "Mission déjà attribuée" });

        mission.technicien_attribue = userId;
        mission.statut_mission = "Attribuée";
        mission.sla_capture.attribution_date = new Date();
        await mission.save();

        const technicien = await User.findById(userId);

        // Notifier tous les managers
        const managers = await User.find({ role: "Manager" });
        for (const manager of managers) {
            const notifMessage = `${technicien.firstName} ${technicien.lastName} s’est attribué la mission "${mission.titre_mission}".`;
            await createNotification(manager._id, "Mission attribuée", notifMessage, "Mission", mission._id);

            req.io.to(manager._id.toString()).emit("notification", {
                title: "Mission attribuée",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            if (manager.deviceTokens?.length > 0) {
                await sendPushNotification(manager.deviceTokens, "Mission attribuée", notifMessage, { missionId: mission._id.toString() });
            }
        }

        res.status(200).json({ message: "Mission attribuée avec succès", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l’attribution", error: error.message });
    }
};

// --------------------
// Technicien met à jour le statut
// --------------------
export const updateMissionStatus = async (req, res) => {
    try {
        const missionId = req.params.id;
        const { statut_mission } = req.body;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        if (mission.technicien_attribue?.toString() !== userId) return res.status(403).json({ message: "Non autorisé à modifier cette mission" });

        const technicien = await User.findById(userId);

        const now = new Date();
        switch (statut_mission) {
            case "En route": mission.sla_capture.en_route_date = now; break;
            case "Arrivé sur site": mission.sla_capture.arrivee_site_date = now; break;
            case "En cours": mission.sla_capture.en_cours_date = now; break;
            case "Terminée": mission.sla_capture.terminee_date = now; break;
            default: return res.status(400).json({ message: "Statut invalide" });
        }
        mission.statut_mission = statut_mission;
        await mission.save();

        // Notifier tous les managers
        const managers = await User.find({ role: "Manager" });
        for (const manager of managers) {
            const notifMessage = `${technicien.firstName} ${technicien.lastName} a changé le statut de "${mission.titre_mission}" à "${statut_mission}".`;
            await createNotification(manager._id, "Mise à jour de mission", notifMessage, "Mission", mission._id);

            req.io.to(manager._id.toString()).emit("notification", {
                title: "Mise à jour de mission",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            if (manager.deviceTokens?.length > 0) {
                await sendPushNotification(manager.deviceTokens, "Mise à jour de mission", notifMessage, { missionId: mission._id.toString() });
            }
        }

        res.status(200).json({ message: "Statut mis à jour", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error: error.message });
    }
};
