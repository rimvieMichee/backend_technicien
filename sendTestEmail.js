import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function sendTestEmail() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Technicien API" <${process.env.SMTP_USER}>`,
            to: "rimvie5812@gmail.com", // ou un autre destinataire
            subject: "🚀 Test de notification Technicien",
            html: `
        <h2>Notification reçue !</h2>
        <p>Ceci est un test d'envoi d'e-mail via Gmail et Nodemailer.</p>
        <p><b>Date :</b> ${new Date().toLocaleString()}</p>
      `,
        });

        console.log("✅ Email envoyé :", info.messageId);
    } catch (error) {
        console.error("❌ Erreur d'envoi d'email :", error);
    }
}

sendTestEmail();
