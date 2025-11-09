import mongoose from "mongoose";
import dotenv from "dotenv";
import Conversation from "../chat/model/Chat.js";
import Message from "../chat/model/Message.js";

dotenv.config();

async function fixLastMessages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connecté à MongoDB");

        const conversations = await Conversation.find();
        console.log(`🔍 ${conversations.length} conversations trouvées.`);

        let updatedCount = 0;

        for (const convo of conversations) {
            const lastMsg = await Message.findOne({ conversation: convo._id })
                .sort({ createdAt: -1 })
                .select("_id createdAt text sender");

            if (lastMsg) {
                convo.lastMessage = lastMsg._id;
                await convo.save();
                updatedCount++;
                console.log(`✅ Conversation ${convo._id} mise à jour avec message ${lastMsg._id}`);
            } else {
                console.log(`⚠️ Aucune message trouvé pour la conversation ${convo._id}`);
            }
        }

        console.log(`🎉 Migration terminée. ${updatedCount} conversations mises à jour.`);
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Erreur migration:", err);
        mongoose.connection.close();
    }
}

fixLastMessages();
