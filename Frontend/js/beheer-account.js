
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const API = "http://localhost:5278";

    const form = $("baPasswordForm");

    const button = $("baSavePassword");

    const passwordFields = [
        $("baCurrentPassword"),
        $("baNewPassword"),
        $("baConfirmPassword")
    ];

    button.disabled = true;

    function feedback(message, error = false) {

        $("baPasswordFeedback").textContent =
            message;

        $("baPasswordFeedback").style.color =
            error ? "#a12b2b" : "#287651";
    }

    async function loadAccount() {

        try {

            const response = await fetch(

                API + "/api/Auth/me",

                {
                    credentials: "include",
                    cache: "no-store"
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Accountgegevens ophalen mislukt."
                );
            }

            const gebruiker = await response.json();

            $("baAccountName").textContent =
                gebruiker.naam || "—";

            $("baAccountEmail").textContent =
                gebruiker.email || "—";

            $("baAccountRoles").textContent =
                (gebruiker.rollen || [])

                    .map(rol =>

                        rol === "Verkeersregelaars"

                            ? "Verkeersregelaar"

                            : rol
                    )

                    .join(" / ");

            button.disabled = false;

        } catch (error) {

            feedback(error.message, true);
        }
    }

    $("baShowPassword").addEventListener(
        "change",
        event => {

            passwordFields.forEach(input => {

                input.type = event.target.checked
                    ? "text"
                    : "password";
            });
        }
    );

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (button.disabled) return;

            const huidigWachtwoord =
                $("baCurrentPassword").value;

            const nieuwWachtwoord =
                $("baNewPassword").value;

            const bevestigWachtwoord =
                $("baConfirmPassword").value;

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
                    "De nieuwe wachtwoorden komen " +
                    "niet overeen.",
                    true
                );

                return;
            }

            if (
                huidigWachtwoord ===
                nieuwWachtwoord
            ) {

                feedback(
                    "Kies een ander wachtwoord.",
                    true
                );

                return;
            }

            button.disabled = true;

            feedback("Wachtwoord wordt gewijzigd...");

            let succes = false;

            try {

                const response = await fetch(

                    API + "/api/MijnAccount/wachtwoord",

                    {
                        method: "PUT",

                        credentials: "include",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            huidigWachtwoord,
                            nieuwWachtwoord,
                            bevestigWachtwoord
                        })
                    }
                );

                if (response.status === 401) {

                    window.location.replace(
                        "login.html"
                    );

                    return;
                }

                if (!response.ok) {

                    if (response.status === 400) {

                        throw new Error(
                            await response.text()
                        );
                    }

                    throw new Error(
                        "Wachtwoord wijzigen mislukt."
                    );
                }

                succes = true;

                form.reset();

                passwordFields.forEach(input => {
                    input.type = "password";
                });

                feedback(
                    "Wachtwoord succesvol gewijzigd."
                );

                window.alert(
                    "Je wachtwoord is gewijzigd. " +
                    "Log opnieuw in met je nieuwe wachtwoord."
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

    loadAccount();

});
