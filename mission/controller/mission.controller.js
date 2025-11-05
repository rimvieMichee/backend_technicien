// mission/controller/mission.controller.js
import Mission from "../model/Mission.js";

// POST : Créer une nouvelle mission
export const createMission = async (req, res) => {
    try {
        const missionData = req.body;

        // Générer idMission si non fourni
        if (!missionData.idMission) {
            const count = await Mission.countDocuments();
            const newId = `M-${String(count + 1).padStart(3, "0")}-2025`;
            missionData.idMission = newId;
        }

        // Optionnel : enregistrer qui crée la mission
        missionData.createdBy = req.user.id;

        const mission = new Mission(missionData);
        await mission.save();

        res.status(201).json({
            message: "Mission créée avec succès",
            mission
        });
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de la mission", error: error.message });
    }
};

// GET : Récupérer toutes les missions
export const getAllMissions = async (req, res) => {
    try {
        const missions = await Mission.find().sort({ createdAt: -1 });
        res.status(200).json(missions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des missions", error: error.message });
    }
};

// GET : Récupérer une mission spécifique
export const getMissionById = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.status(200).json(mission);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// PUT : Mettre à jour une mission (Manager uniquement via route)
export const updateMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.status(200).json({ message: "Mission mise à jour", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

// DELETE : Supprimer une mission (Manager uniquement via route)
export const deleteMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.status(200).json({ message: "Mission supprimée", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// POST : Technicien s'attribue une mission
export const assignMission = async (req, res) => {
    try {
        const missionId = req.params.id;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        if (mission.technicien_attribue) {
            return res.status(400).json({ message: "Mission déjà attribuée à un technicien" });
        }

        mission.technicien_attribue = userId;
        mission.statut_mission = "Attribuée";
        mission.sla_capture.attribution_date = new Date();

        await mission.save();

        res.status(200).json({ message: "Mission attribuée avec succès", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'attribution", error: error.message });
    }
};

export const updateMissionStatus = async (req, res) => {
    try {
        const missionId = req.params.id;
        const { statut_mission } = req.body;
        const userId = req.user.id;

        const mission = await Mission.findById(missionId);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });

        // Vérifie que c'est le technicien attribué qui modifie
        if (mission.technicien_attribue !== userId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette mission" });
        }

        // Met à jour la date correspondante dans sla_capture selon le statut
        const now = new Date();
        switch (statut_mission) {
            case "En route":
                mission.sla_capture.en_route_date = now;
                break;
            case "Arrivé sur site":
                mission.sla_capture.arrivee_site_date = now;
                break;
            case "En cours":
                mission.sla_capture.rapport_soumis_date = now; // on peut ajuster si besoin
                break;
            case "Terminée":
                mission.statut_mission = "Terminée";
                break;
            default:
                return res.status(400).json({ message: "Statut invalide" });
        }

        mission.statut_mission = statut_mission;
        await mission.save();

        res.status(200).json({ message: "Statut mis à jour", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut", error: error.message });
    }
};
