// mission/controller/mission.controller.js
import Mission from "../model/Mission.js";
import User from "../../auth/model/User.js";
import { createNotification } from "../../notification/utils/notify.js";
import { sendPushNotification } from "../../config/fcm.js";
import {populate} from "dotenv";


// Créer une mission (Manager)
export const createMission = async (req, res) => {
    try {
        const missionData = req.body;
        if (!missionData.idMission) {
            const count = await Mission.countDocuments();
            missionData.idMission = `M-${String(count + 1).padStart(3, "0")}-2025`;
        }
        missionData.createdBy = req.user.id;
        if (!missionData.sla_capture) {
            missionData.sla_capture = {
                attribution_date: null,
                en_route_date: null,
                arrivee_site_date: null,
                en_cours_date: null,
                terminee_date: null,
            };
        }
        missionData.missionsTerminees = false;
        const mission = await Mission.create(missionData);
        //=================== Notifier tous les techniciens
        const technicians = await User.find({ role: "Technicien" });
        for (const tech of technicians) {
            const notifMessage = `Une nouvelle mission "${mission.titre_mission}" a été créée.`;
            await createNotification(tech._id, "Nouvelle mission disponible", notifMessage, "Mission", mission._id);
            req.io.to(tech._id.toString()).emit("notification", {
                title: "Nouvelle mission disponible",
                message: notifMessage,
                missionId: mission._id.toString(),
            });
            if (tech.deviceTokens?.length > 0) {
                await sendPushNotification(
                    tech.deviceTokens,
                    "Nouvelle mission disponible",
                    notifMessage,
                    { missionId: mission._id.toString() }
                );
            }
        }
        res.status(201).json({
            message: "Mission créée avec succès",
            mission,
        });
    } catch (error) {
        console.error("Erreur création mission:", error);
        res.status(400).json({
            message: "Erreur lors de la création de la mission",
            error: error.message,
        });
    }
};

//  Récupérer toutes les missions
// Rimvie, l'importance du populate est à retenir
export const getAllMissions = async (req, res) => {
    try {
        // Juste recuperer les missions dont le statut est disponible
        const missions = await Mission.find({statut_mission: "Disponible"})
            .populate("createdBy", "firstName lastName phone post")
            .populate("technicien_attribue", "firstName lastName phone post");

        res.status(200).json(missions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des missions", error });
    }
};
// Récupérer les missions du technicien connecté
export const getMissionsByTechnicien = async (req, res) => {
    try {
        const userId = req.user.id;
        const missions = await Mission.find({ technicien_attribue: userId })
            .populate("createdBy", "firstName lastName phone post")
            .populate("technicien_attribue", "firstName lastName phone post")
            .sort({ createdAt: -1 });

        //  Si aucune mission
        if (!missions || missions.length === 0) {
            return res.status(200).json({
                message: "Aucune mission attribuée à ce technicien",
                missions: [],
            });
        }

        //  Succès
        res.status(200).json({
            message: `Missions du technicien récupérées avec succès (${missions.length})`,
            missions,
        });

    } catch (error) {
        console.error("Erreur getMissionsByTechnicien:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des missions du technicien",
            error: error.message,
        });
    }
};

// (Manager/Admin) Récupérer les missions d’un technicien donné
export const getMissionsByTechnicienId = async (req, res) => {
    try {
        const { id } = req.params; // ✅ ID du technicien transmis dans l’URL

        // Vérification de l’existence du technicien
        const technicien = await User.findById(id);
        if (!technicien || technicien.role !== "Technicien") {
            return res.status(404).json({ message: "Technicien non trouvé" });
        }

        // Rechercher les missions attribuées à ce technicien
        const missions = await Mission.find({ technicien_attribue: id })
            .populate("createdBy", "firstName lastName phone post")
            .populate("technicien_attribue", "firstName lastName phone post")
            .sort({ createdAt: -1 });

        if (!missions || missions.length === 0) {
            return res.status(200).json({
                message: `Aucune mission attribuée à ${technicien.firstName} ${technicien.lastName}`,
                missions: [],
            });
        }

        res.status(200).json({
            message: `Missions de ${technicien.firstName} ${technicien.lastName} récupérées avec succès (${missions.length})`,
            missions,
        });
    } catch (error) {
        console.error("❌ Erreur getMissionsByTechnicienId:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des missions du technicien",
            error: error.message,
        });
    }
};

// Récupérer une mission par ID
export const getMissionById = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id)
            .populate("createdBy", "firstName lastName phone post")
            .populate("technicien_attribue", "firstName lastName phone post");

        if (!mission) {
            return res.status(404).json({ message: "Mission non trouvée" });
        }

        res.status(200).json(mission);
    } catch (error) {
        console.error("Erreur getMissionById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Mettre à jour une mission (Manager)
export const updateMission = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        // Mettre à jour tous les champs reçus
        Object.assign(mission, req.body);

        // ✅ Mettre à jour missionsTerminees selon le statut
        mission.missionsTerminees = mission.statut_mission === "Terminée";

        await mission.save();

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

// Supprimer une mission
export const deleteMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.status(200).json({ message: "Mission supprimée", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// Technicien s’attribue une mission
export const assignMission = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        if (mission.technicien_attribue) return res.status(400).json({ message: "Mission déjà attribuée" });

        // ✅ Sécuriser l'accès à sla_capture
        if (!mission.sla_capture) {
            mission.sla_capture = {};
        }

        mission.technicien_attribue = userId;
        mission.statut_mission = "Attribuée";
        mission.sla_capture.attribution_date = new Date();

        // ✅ Mettre à jour missionsTerminees
        mission.missionsTerminees = mission.statut_mission === "Terminée";

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
        console.error("Erreur assignMission:", error);
        res.status(500).json({ message: "Erreur lors de l’attribution", error: error.message });
    }
};

// Technicien met à jour le statut
export const updateMissionStatus = async (req, res) => {
    try {
        const missionId = req.params.id;
        const { statut_mission } = req.body;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        if (mission.technicien_attribue?.toString() !== userId)
            return res.status(403).json({ message: "Non autorisé à modifier cette mission" });

        const technicien = await User.findById(userId);

        const now = new Date();
        switch (statut_mission) {
            case "En route":
                mission.sla_capture.en_route_date = now;
                break;
            case "Arrivé sur site":
                mission.sla_capture.arrivee_site_date = now;
                break;
            case "En cours":
                mission.sla_capture.en_cours_date = now;
                break;
            case "Terminée":
                mission.sla_capture.terminee_date = now;
                mission.missionsTerminees = true;
                break;
            default:
                return res.status(400).json({ message: "Statut invalide" });
        }

        if (statut_mission !== "Terminée") {
            mission.missionsTerminees = false;
        }
        mission.statut_mission = statut_mission;
        await mission.save();
        //============== Notifier tous les managers
        const managers = await User.find({ role: "Manager" });
        for (const manager of managers) {
            const notifMessage = `${technicien.firstName} ${technicien.lastName} a changé le statut de "${mission.titre_mission}" à "${statut_mission}".`;
            await createNotification(manager._id, "Mise à jour de mission", notifMessage, "Mission", mission._id);

            req.io.to(manager._id.toString()).emit("notification", {
                title: "Mise à jour de mission",
                message: notifMessage,
                missionId: mission._id.toString(),
            });
            if (manager.deviceTokens?.length > 0) {
                await sendPushNotification(manager.deviceTokens, "Mise à jour de mission", notifMessage, {
                    missionId: mission._id.toString(),
                });
            }
        }
        res.status(200).json({ message: "Statut mis à jour", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error: error.message });
    }
};


// Technicien crée ou met à jour le rapport
export const submitRapport = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id;
        const {
            travail_effectue,
            statut_resolution,
            prochaine_etape,
            materiel_utilise,
            photos,
            signature_client,
            notes_additionnelles
        } = req.body;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        // Seul le technicien attribué peut soumettre un rapport
        if (mission.technicien_attribue?.toString() !== userId)
            return res.status(403).json({ message: "Non autorisé à soumettre le rapport" });

        // Créer / mettre à jour le rapport
        mission.rapport_intervention = {
            travail_effectue,
            statut_resolution,
            prochaine_etape,
            materiel_utilise: materiel_utilise || [],
            photos: photos || [],
            signature_client,
            notes_additionnelles: notes_additionnelles || "",
            valide: false // par défaut non validé
        };

        await mission.save();

        // Notifier les managers
        const managers = await User.find({ role: "Manager" });
        for (const manager of managers) {
            const notifMessage = `${req.user.firstName} ${req.user.lastName} a soumis le rapport de la mission "${mission.titre_mission}".`;
            await createNotification(manager._id, "Nouveau rapport soumis", notifMessage, "Rapport", mission._id);

            req.io.to(manager._id.toString()).emit("notification", {
                title: "Nouveau rapport soumis",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            if (manager.deviceTokens?.length > 0) {
                await sendPushNotification(manager.deviceTokens, "Nouveau rapport soumis", notifMessage, { missionId: mission._id.toString() });
            }
        }

        res.status(200).json({ message: "Rapport soumis avec succès", rapport: mission.rapport_intervention });

    } catch (error) {
        console.error("Erreur submitRapport:", error);
        res.status(500).json({ message: "Erreur lors de la soumission du rapport", error: error.message });
    }
};

// Manager consulte le rapport
export const viewRapport = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id)
            .populate("technicien_attribue", "firstName lastName")
            .populate("createdBy", "firstName lastName");

        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        if (!mission.rapport_intervention || Object.keys(mission.rapport_intervention).length === 0) {
            return res.status(200).json({ message: "Aucun rapport disponible", rapport: null });
        }

        res.status(200).json({ rapport: mission.rapport_intervention });
    } catch (error) {
        console.error("Erreur viewRapport:", error);
        res.status(500).json({ message: "Erreur lors de la récupération du rapport", error: error.message });
    }
};

// Manager valide le rapport
export const validateRapport = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        if (!mission.rapport_intervention || Object.keys(mission.rapport_intervention).length === 0) {
            return res.status(400).json({ message: "Aucun rapport à valider" });
        }

        // Ajouter le champ "valide" dans le rapport
        mission.rapport_intervention.valide = true;
        await mission.save();

        // Notifier le technicien
        const tech = await User.findById(mission.technicien_attribue);
        if (tech) {
            const notifMessage = `Le rapport de votre mission "${mission.titre_mission}" a été validé par le manager.`;
            await createNotification(tech._id, "Rapport validé", notifMessage, "Rapport", mission._id);

            req.io.to(tech._id.toString()).emit("notification", {
                title: "Rapport validé",
                message: notifMessage,
                missionId: mission._id.toString()
            });

            if (tech.deviceTokens?.length > 0) {
                await sendPushNotification(tech.deviceTokens, "Rapport validé", notifMessage, { missionId: mission._id.toString() });
            }
        }

        res.status(200).json({ message: "Rapport validé avec succès", rapport: mission.rapport_intervention });

    } catch (error) {
        console.error("Erreur validateRapport:", error);
        res.status(500).json({ message: "Erreur lors de la validation du rapport", error: error.message });
    }
};

