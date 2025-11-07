// mission/Mission.js
import mongoose from "mongoose";

const slaSchema = new mongoose.Schema({
    creation_date: { type: Date, default: Date.now },
    attribution_date: { type: Date },
    en_route_date: { type: Date },
    arrivee_site_date: { type: Date },
    en_cours_date: { type: Date },
    terminee_date: { type: Date },
    rapport_soumis_date: { type: Date }
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
        enum: ["Disponible", "Attribuée", "En route", "Arrivé sur site", "En cours", "En attente de pièces", "Terminée"],
        default: "Disponible"
    },
    technicien_attribue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    sla_capture: {
        attribution_date: { type: Date, default: null },
        en_route_date: { type: Date, default: null },
        arrivee_site_date: { type: Date, default: null },
        en_cours_date: { type: Date, default: null },
        terminee_date: { type: Date, default: null },
    },
    rapport_intervention: rapportSchema,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    missionsTerminees: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Mission", missionSchema);
