
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const API = "http://localhost:5278";

    const requestForm = $("brRequestForm");

    const confirmForm = $("brConfirmForm");

    const params = new URLSearchParams(
        window.location.hash.substring(1)
    );

    const token = params.get("token");

    // Verwijder het token uit de zichtbare URL.
    if (token) {

        history.replaceState(
            null,
            "",
            window.location.pathname
        );
    }

    function feedback(message, error = false) {

        $("brFeedback").textContent = message;

        $("brFeedback").style.color =
            error ? "#a12b2b" : "#287651";
    }

    async function request(path, data) {

        const response = await fetch(

            API + path,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "omit",

                cache: "no-store",

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {

            if (response.status === 400) {

                throw new Error(
                    await response.text()
                );
            }

            throw new Error(
                "Er is een fout opgetreden. " +
                "Probeer het opnieuw."
            );
        }

        return await response.json();
    }

    // ======================================
    // RESETLINK AANVRAGEN
    // ======================================

    requestForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button = requestForm.querySelector(
                'button[type="submit"]'
            );

            if (button.disabled) return;

            button.disabled = true;

            feedback("Aanvraag wordt verwerkt...");

            try {

                const result = await request(

                    "/api/WachtwoordReset/aanvragen",

                    {
                        email: $("brEmail").value.trim()
                    }
                );

                feedback(result.melding);

                requestForm.reset();

            } catch (error) {

                feedback(error.message, true);

            } finally {

                button.disabled = false;
            }
        }
    );

    // ======================================
    // RESETLINK OPENEN
    // ======================================

    if (token) {

        requestForm.hidden = true;

        confirmForm.hidden = false;

        $("brTitle").textContent =
            "Nieuw wachtwoord instellen";

        $("brDescription").textContent =
            "Kies een nieuw wachtwoord van " +
            "minimaal 12 tekens.";
    }

    // ======================================
    // NIEUW WACHTWOORD OPSLAAN
    // ======================================

    confirmForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button = confirmForm.querySelector(
                'button[type="submit"]'
            );

            if (button.disabled) return;

            const nieuwWachtwoord =
                $("brNewPassword").value;

            const bevestigWachtwoord =
                $("brConfirmPassword").value;

            if (nieuwWachtwoord.length < 12) {

                feedback(
                    "Gebruik minimaal 12 tekens.",
                    true
                );

                return;
            }

            if (
                nieuwWachtwoord !==
                bevestigWachtwoord
            ) {

                feedback(
                    "De wachtwoorden komen niet overeen.",
                    true
                );

                return;
            }

            button.disabled = true;

            feedback("Wachtwoord wordt opgeslagen...");

            let succes = false;

            try {

                const result = await request(

                    "/api/WachtwoordReset/bevestigen",

                    {
                        token,
                        nieuwWachtwoord,
                        bevestigWachtwoord
                    }
                );

                succes = true;

                confirmForm.reset();

                confirmForm.hidden = true;

                feedback(result.melding);

                window.alert(
                    "Je wachtwoord is gewijzigd. " +
                    "Je kunt nu opnieuw inloggen."
                );

                window.location.replace("login.html");

            } catch (error) {

                feedback(error.message, true);

            } finally {

                if (!succes) {

                    button.disabled = false;
                }
            }
        }
    );

});
