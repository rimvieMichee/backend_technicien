// mission/mission.controller.js
// mission/controller/mission.controller.js
import Mission from "../model/Mission.js";



//  POST : Créer une nouvelle mission
export const createMission = async (req, res) => {
    try {
        const missionData = req.body;

        // Si l'idMission n'est pas fourni, on en génère un automatiquement
        if (!missionData.idMission) {
            const count = await Mission.countDocuments();
            const newId = `M-${String(count + 1).padStart(3, "0")}-2025`;
            missionData.idMission = newId;
        }

        const mission = new Mission(missionData);
        await mission.save();

        res.status(201).json({
            message: "Mission créée avec succès ",
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

//  GET : Récupérer une mission spécifique
export const getMissionById = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
        res.json(mission);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
