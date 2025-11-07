import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true = port 465, false = 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Petite fonction d'envoi d'e-mail avec logs
export const sendEmail = async (to, subject, text) => {
    try {
        console.log("📧 Tentative d'envoi d'e-mail...");
        console.log("➡️ Destinataire :", to);
        console.log("➡️ Sujet :", subject);

        const info = await transporter.sendMail({
            from: `"Support Mistra" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });

        console.log("✅ E-mail envoyé avec succès !");
        console.log("📨 Message ID :", info.messageId);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'e-mail :", error.message);
        throw error; // pour que le contrôleur le capture et renvoie une erreur 500
    }
};
