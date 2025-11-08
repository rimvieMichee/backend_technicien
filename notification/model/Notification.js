import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Mission", "System", "User", "Other", "Message", "Rapport"],
            default: "Mission",
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "type",
        },
        tag: {
            type: String,
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
