// mission/Mission.js
import mongoose from "mongoose";

const slaSchema = new mongoose.Schema({
    creation_date: Date,
    attribution_date: Date,
    en_route_date: Date,
    arrivee_site_date: Date,
    rapport_soumis_date: Date
}, { _id: false });

const rapportSchema = new mongoose.Schema({
    titre: String,
    description: String,
    materiel_utilise: [String],
    resolution: String
}, { _id: false });

const missionSchema = new mongoose.Schema({
    idMission: { type: String, unique: true },
    client: { type: String, required: true },
    adresse: { type: String, required: true },
    lieu: { type: String },
    titre_mission: { type: String },
    type_intervention: { type: String, enum: ["Curatif", "Préventif"], required: true },
    type_equipement: { type: String },
    id_equipement: { type: String },
    niveau_risque: { type: String, enum: ["faible", "moyen", "élevé", "critique"], required: true },
    niveau_priorite: {
        type: String,
        enum: ["Normal", "Urgent", "Critique"],
        default: "Normal"
    },
    echeance: { type: Date },
    descriptif: { type: String },
    materiel_remplacement_requis: { type: Boolean, default: false },
    statut_mission: {
        type: String,
        enum: ["Disponible", "En cours", "En attente de pièces", "Terminée"],
        default: "Disponible"
    },
    technicien_attribue: { type: String, default: null },
    sla_capture: slaSchema,
    rapport_intervention: rapportSchema
}, { timestamps: true });

export default mongoose.model("Mission", missionSchema);
