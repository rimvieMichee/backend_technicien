import fetch from "node-fetch";

const url = "https://mistra.onrender.com/api/users/forgot-password";

async function testForgotPassword() {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "rimvie5812@gmail.com" // ton email de test
            })
        });

        const data = await response.json();
        console.log(" Réponse API :", data);

        // Si tu veux afficher l'OTP généré (si le serveur l’envoie)
        if (data.otp) {
            console.log("OTP généré :", data.otp);
        } else {
            console.log("L'OTP n'est pas renvoyé par le serveur, vérifie l'email reçu.");
        }

    } catch (error) {
        console.error("Erreur lors du test :", error.message);
    }
}

testForgotPassword();
