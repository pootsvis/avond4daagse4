
// ==========================================
// AVOND4DAAGSE 2027
// LOGIN - FRONTEND / BACKEND KOPPELING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Lokale backend
    const API_BASE_URL = "http://localhost:5278";

    // HTML-elementen
    const loginForm = document.getElementById("blLoginForm");
    const emailInput = document.getElementById("blEmail");
    const passwordInput = document.getElementById("blPassword");
    const loginButton = document.getElementById("blLoginButton");
    const loginButtonText = document.getElementById("blLoginButtonText");
    const loginMessage = document.getElementById("blLoginMessage");

    // Rollen die toegang mogen krijgen
    const BEHEER_ROLLEN = [
        "Voorzitter",
        "Beheerder",
        "Secretaris",
        "Penningmeester",
        "Vrijwilliger",
        "Verkeersregelaars"
    ];

    // Bericht op de pagina tonen
    function showMessage(message, isError = true) {

        loginMessage.hidden = false;
        loginMessage.textContent = message;

        loginMessage.style.color = isError
            ? "#a12b2b"
            : "#246847";
    }

    // Laadstatus van de knop
    function setLoading(loading) {

        loginButton.disabled = loading;

        loginButtonText.textContent = loading
            ? "Bezig met inloggen..."
            : "Inloggen";
    }

    // Controleren welke rollen een gebruiker heeft
    function heeftBeheerRol(rollen) {

        return rollen.some(rol =>
            BEHEER_ROLLEN.includes(rol)
        );
    }

    // ======================================
    // INLOGGEN
    // ======================================

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();
        const wachtwoord = passwordInput.value;

        if (!email || !wachtwoord) {
            showMessage("Vul je e-mailadres en wachtwoord in.");
            return;
        }

        loginMessage.hidden = true;
        setLoading(true);

        try {

            // Stap 1: inloggen bij de API
            const loginResponse = await fetch(
                `${API_BASE_URL}/api/Auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        wachtwoord: wachtwoord
                    })
                }
            );

            if (loginResponse.status === 401) {

                showMessage(
                    "E-mailadres of wachtwoord is onjuist."
                );

                return;
            }

            if (!loginResponse.ok) {

                showMessage(
                    "Inloggen is mislukt. Probeer het opnieuw."
                );

                return;
            }

            // Stap 2: gecontroleerd ingelogde gebruiker ophalen
            const meResponse = await fetch(
                `${API_BASE_URL}/api/Auth/me`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );

            if (!meResponse.ok) {

                showMessage(
                    "Inloggen is gelukt, maar de sessie kon niet worden gecontroleerd."
                );

                return;
            }

            const gebruiker = await meResponse.json();

            const rollen = Array.isArray(gebruiker.rollen)
                ? gebruiker.rollen
                : [];

            // Stap 3: controleren of de gebruiker beheerrechten heeft
            if (!heeftBeheerRol(rollen)) {

                showMessage(
                    "Je bent ingelogd, maar dit account heeft geen beheerrechten. Vraag de organisatie om de juiste rol.",
                    true
                );

                return;
            }

            // Stap 4: doorsturen naar dashboard
            showMessage(
                "Inloggen gelukt! Dashboard wordt geopend.",
                false
            );

            if (rollen.includes("Voorzitter")) {

    window.location.assign("dashboard.html");

} else if (rollen.includes("Penningmeester")) {

    window.location.assign("financien.html");

} else if (rollen.includes("Secretaris")) {

    window.location.assign("contactvragen.html");

} else if (
    rollen.includes("Vrijwilliger") ||
    rollen.includes("Verkeersregelaars")
) {

    window.location.assign("mijn-beschikbaarheid.html");

} else {

    showMessage("Dit account heeft geen geldige organisatierol.");
}

        } catch (error) {

            console.error("Inlogfout:", error);

            showMessage(
                "Kan geen verbinding maken met de backend. Controleer of de API draait op localhost:5278."
            );

        } finally {

            setLoading(false);
        }

    });

});
