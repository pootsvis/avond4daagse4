
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const API = "http://localhost:5278";

    const ORGANISATIE_ROLLEN = [
        "Voorzitter",
        "Secretaris",
        "Penningmeester",
        "Vrijwilliger",
        "Verkeersregelaars"
    ];

    let gebruikers = [];
    let rollen = [];
    let busy = false;

    async function request(
        path,
        method = "GET",
        data
    ) {

        const response = await fetch(API + path, {

            method,

            credentials: "include",

            cache: "no-store",

            headers: {
                "Content-Type": "application/json"
            },

            body: data === undefined
                ? undefined
                : JSON.stringify(data)
        });

        if (!response.ok) {

            if (response.status === 403) {

                throw new Error(
                    "Alleen de voorzitter heeft toegang."
                );
            }

            throw new Error(
                "API-fout: HTTP " + response.status +
                " — " + await response.text()
            );
        }

        if (response.status === 204) {

            return null;
        }

        return await response.json();
    }

    function feedback(message, error = false) {

        $("bgFeedback").textContent = message;

        $("bgFeedback").style.color =
            error ? "#a12b2b" : "#287651";
    }

    function label(rol) {

        return rol === "Verkeersregelaars"
            ? "Verkeersregelaar"
            : rol;
    }

    function create(tag, text, className) {

        const node = document.createElement(tag);

        if (text !== undefined) {

            node.textContent = text;
        }

        if (className) {

            node.className = className;
        }

        return node;
    }

    function vulRollen(select, bestaande = []) {

        select.replaceChildren(
            new Option("Selecteer rol", "")
        );

        rollen.filter(rol =>
            !bestaande.includes(rol.naam)
        ).forEach(rol => {

            select.add(
                new Option(
                    label(rol.naam),
                    rol.rolId
                )
            );
        });
    }

    function updateStats() {

        $("bgTotal").textContent =
            gebruikers.length;

        $("bgOrganisation").textContent =
            gebruikers.filter(g =>
                g.rollen.some(rol =>
                    ORGANISATIE_ROLLEN.includes(rol)
                )
            ).length;

        $("bgRoles").textContent = rollen.length;
    }

    function render() {

        const tbody = $("bgTableBody");

        tbody.replaceChildren();

        const search = $("bgSearch")
            .value.trim().toLowerCase();

        const resultaten = gebruikers.filter(g =>

            g.naam.toLowerCase().includes(search) ||

            g.email.toLowerCase().includes(search)
        );

        if (!resultaten.length) {

            const row = create("tr");

            const cell = create(
                "td",
                "Geen gebruikers gevonden."
            );

            cell.colSpan = 4;

            row.appendChild(cell);

            tbody.appendChild(row);
        }

        resultaten.forEach(g => {

            const row = create("tr");

            const naam = create("td", g.naam);

            const email = create("td", g.email);

            const roleCell = create("td");

            if (!g.rollen.length) {

                roleCell.textContent = "Geen rollen";
            }

            g.rollen.forEach(rol => {

                roleCell.appendChild(

                    create(
                        "span",
                        label(rol),
                        "bg-role-label"
                    )
                );
            });

            const actionCell = create("td");

            const actions = create(
                "div",
                undefined,
                "bg-role-actions"
            );

            const select = create(
                "select",
                undefined,
                "bg-role-select"
            );

            select.setAttribute(
                "aria-label",
                "Rol toevoegen voor " + g.naam
            );

            vulRollen(select, g.rollen);

            const button = create(
                "button",
                "Toevoegen",
                "bg-button"
            );

            button.type = "button";

            button.disabled = true;

            select.addEventListener("change", () => {

                button.disabled =
                    busy || !select.value;
            });

            button.addEventListener("click", async () => {

                if (busy || !select.value) return;

                busy = true;

                button.disabled = true;

                try {

                    await request(

                        "/api/Rol/" + select.value +

                        "/gebruikers/" + g.gebruikerId,

                        "POST"
                    );

                    await loadUsers();

                    feedback(
                        "Rol toegevoegd aan " + g.naam + "."
                    );

                } catch (error) {

                    feedback(error.message, true);

                } finally {

                    busy = false;

                    button.disabled = !select.value;
                }
            });

            actions.append(select, button);

            actionCell.appendChild(actions);

            row.append(
                naam,
                email,
                roleCell,
                actionCell
            );

            tbody.appendChild(row);
        });

        updateStats();
    }

    async function loadUsers() {

        gebruikers = await request(
            "/api/Gebruikersbeheer"
        );

        render();
    }

    $("bgCreateForm").addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (busy) return;

            busy = true;

            const button = event.target.querySelector(
                'button[type="submit"]'
            );

            button.disabled = true;

            let accountAangemaakt = false;

            try {

                const naam = $("bgName").value.trim();

                const email = $("bgEmail")
                    .value.trim().toLowerCase();

                const wachtwoord =
                    $("bgPassword").value;

                const rolId =
                    $("bgCreateRole").value;

                if (!naam || !email || !rolId) {

                    throw new Error(
                        "Vul alle velden in."
                    );
                }

                if (wachtwoord.length < 8) {

                    throw new Error(
                        "Gebruik minimaal 8 tekens."
                    );
                }

                if (gebruikers.some(g =>

                    g.email.toLowerCase() === email

                )) {

                    throw new Error(
                        "Dit e-mailadres bestaat al."
                    );
                }

                const gebruiker = await request(

                    "/api/Gebruiker",

                    "POST",

                    {
                        naam,
                        email,
                        wachtwoord
                    }
                );

                accountAangemaakt = true;

                $("bgPassword").value = "";

                await request(

                    "/api/Rol/" + rolId +

                    "/gebruikers/" +
                    gebruiker.gebruikerId,

                    "POST"
                );

                event.target.reset();

                await loadUsers();

                feedback(
                    "Account en rol succesvol aangemaakt."
                );

            } catch (error) {

                if (accountAangemaakt) {

                    feedback(

                        "Het account is aangemaakt, maar " +
                        "de vervolgactie is mislukt. " +
                        "Controleer het gebruikersoverzicht. " +
                        error.message,

                        true
                    );

                    try {

                        await loadUsers();

                    } catch {}
                } else {

                    feedback(error.message, true);
                }

            } finally {

                busy = false;

                button.disabled = false;
            }
        }
    );

    $("bgSearch").addEventListener(
        "input",
        render
    );

    $("bgRefresh").addEventListener(
        "click",
        async () => {

            try {

                await loadUsers();

                feedback("Overzicht bijgewerkt.");

            } catch (error) {

                feedback(error.message, true);
            }
        }
    );

    async function initialize() {

        try {

            const gebruiker = await request(
                "/api/Auth/me"
            );

            if (!gebruiker.rollen.includes("Voorzitter")) {

                window.location.replace("dashboard.html");

                return;
            }

            const alleRollen = await request(
                "/api/Rol"
            );

            rollen = alleRollen.filter(rol =>

                ORGANISATIE_ROLLEN.includes(rol.naam)
            );

            vulRollen($("bgCreateRole"));

            await loadUsers();

        } catch (error) {

            feedback(error.message, true);
        }
    }

    initialize();

});
