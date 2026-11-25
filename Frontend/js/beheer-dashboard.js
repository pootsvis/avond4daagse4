
// ==========================================
// AVOND4DAAGSE 2027
// DASHBOARD PER GEBRUIKERSROL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5278";

    const stats = document.querySelectorAll(
        ".bm-stat-card"
    );

    const tableBody = document.querySelector(
        ".bm-table tbody"
    );

    const recentPanel = tableBody?.closest(
        ".bm-panel"
    );

    const notice = document.querySelector(
        ".bm-notice"
    );

    const noticeTitle = notice.querySelector(
        "strong"
    );

    const noticeText = notice.querySelector(
        "p"
    );

    const numberFormat =
        new Intl.NumberFormat("nl-NL");

    // ======================================
    // 1. API
    // ======================================

    async function getData(path) {

        const response = await fetch(

            API_URL + path,

            {
                credentials: "include",

                cache: "no-store",

                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (response.status === 401) {

            throw new Error(
                "Je bent niet ingelogd."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Geen toegang tot deze gegevens."
            );
        }

        if (!response.ok) {

            throw new Error(
                "API-fout: HTTP " + response.status
            );
        }

        return await response.json();
    }

    // ======================================
    // 2. STATISTIEKEN
    // ======================================

    function updateStat(
        index,
        label,
        value,
        icon,
        description
    ) {

        const card = stats[index];

        if (!card) return;

        card.querySelector(
            ".bm-stat-head > span:first-child"
        ).textContent = label;

        card.querySelector(
            ".bm-stat-icon"
        ).textContent = icon;

        card.querySelector(
            "strong"
        ).textContent =
            typeof value === "number"
                ? numberFormat.format(value)
                : value;

        const footer = card.querySelector(
            ".bm-stat-foot"
        );

        const dot = document.createElement("span");

        dot.className = "bm-stat-dot";

        footer.replaceChildren(
            dot,
            document.createTextNode(description)
        );
    }

    function countParticipants(inschrijvingen) {

        return inschrijvingen.reduce(
            (total, item) => {

                if (
                    item.aantalDeelnemers != null &&
                    Number.isFinite(
                        Number(item.aantalDeelnemers)
                    )
                ) {

                    return total +
                        Number(item.aantalDeelnemers);
                }

                return total + (
                    Array.isArray(item.deelnemers)
                        ? item.deelnemers.length
                        : 0
                );
            },

            0
        );
    }

    // ======================================
    // 3. RECENTE INSCHRIJVINGEN
    // ======================================

    function showTableMessage(message) {

        tableBody.replaceChildren();

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 3;

        cell.textContent = message;

        row.appendChild(cell);

        tableBody.appendChild(row);
    }

    function renderRecentRegistrations(items) {

        tableBody.replaceChildren();

        if (!items.length) {

            showTableMessage(
                "Er zijn nog geen inschrijvingen."
            );

            return;
        }

        const recent = [...items]

            .sort((a, b) =>

                (Date.parse(b.inschrijfdatum) || 0) -
                (Date.parse(a.inschrijfdatum) || 0) ||

                Number(b.inschrijvingId) -
                Number(a.inschrijvingId)
            )

            .slice(0, 5);

        recent.forEach(item => {

            const row = document.createElement("tr");

            const nameCell =
                document.createElement("td");

            const distanceCell =
                document.createElement("td");

            const statusCell =
                document.createElement("td");

            const badge =
                document.createElement("span");

            const deelnemers =
                Array.isArray(item.deelnemers)
                    ? item.deelnemers
                    : [];

            const names = deelnemers
                .map(person =>

                    [
                        person.voornaam,
                        person.achternaam
                    ].filter(Boolean).join(" ")
                )
                .filter(Boolean);

            nameCell.textContent =
                names.length
                    ? names.join(", ")
                    : "Inschrijving #" +
                      item.inschrijvingId;

            distanceCell.textContent =
                item.afstandKm
                    ? item.afstandKm + " km"
                    : "—";

            const status =
                item.status || "Onbekend";

            badge.className =
                "bm-status " +

                (
                    status.toLowerCase() === "betaald"
                        ? "bm-paid"
                        : "bm-pending"
                );

            badge.textContent = status;

            statusCell.appendChild(badge);

            row.append(
                nameCell,
                distanceCell,
                statusCell
            );

            tableBody.appendChild(row);
        });
    }

    // ======================================
    // 4. INTERFACE VOORBEREIDEN
    // ======================================

    function prepareDashboard() {

        const tag = document.querySelector(
            ".bm-demo-tag"
        );

        if (tag) {

            tag.textContent = "Persoonlijk overzicht";
        }

        const caption = document.querySelector(
            ".bm-section-caption"
        );

        if (caption) {

            caption.textContent = "Actuele gegevens";
        }

        const footer = document.querySelector(
            ".bm-content-footer"
        );

        if (footer) {

            footer.textContent =
                "Avond4daagse 2027 · Beheeromgeving";
        }

        if (recentPanel) {

            recentPanel.style.display = "none";

            const eyebrow = recentPanel.querySelector(
                ".bm-eyebrow"
            );

            if (eyebrow) {

                eyebrow.textContent =
                    "LAATSTE INSCHRIJVINGEN";
            }

            const note = recentPanel.querySelector(
                ".bm-panel-note"
            );

            if (note) {

                note.textContent =
                    "De vijf meest recente inschrijvingen.";
            }
        }

        showTableMessage(
            "Gegevens worden geladen..."
        );

        stats.forEach((card, index) => {

            updateStat(
                index,
                "Gegevens",
                "—",
                "◎",
                "Bezig met laden"
            );
        });

        noticeTitle.textContent =
            "Dashboard laden";

        noticeText.textContent =
            "Je persoonlijke overzicht wordt opgehaald.";
    }

    // ======================================
    // 5. DASHBOARD LADEN
    // ======================================

    async function loadDashboard() {

        prepareDashboard();

        try {

            const gebruiker = await getData(
                "/api/Auth/me"
            );

            const rollen =
                Array.isArray(gebruiker.rollen)
                    ? gebruiker.rollen
                    : [];

            const voorzitter =
                rollen.includes("Voorzitter");

            const secretaris =
                rollen.includes("Secretaris");

            const penningmeester =
                rollen.includes("Penningmeester");

            const vrijwilliger =
                rollen.includes("Vrijwilliger") ||
                rollen.includes("Verkeersregelaars");

            const errors = [];

            // Alleen toegestane gegevens ophalen.

            async function veiligOphalen(path) {

                try {

                    const data = await getData(path);

                    if (!Array.isArray(data)) {

                        throw new Error(
                            "Onverwacht API-antwoord."
                        );
                    }

                    return data;

                } catch (error) {

                    errors.push(
                        path + ": " + error.message
                    );

                    return null;
                }
            }

            // Algemene gegevens zijn voor alle rollen.

            const [routes, diensten] =
                await Promise.all([

                    veiligOphalen("/api/Route"),

                    veiligOphalen("/api/Inzetschema")
                ]);

            if (voorzitter) {

                const [inschrijvingen, vrijwilligers] =
                    await Promise.all([

                        veiligOphalen("/api/Inschrijving"),

                        veiligOphalen("/api/Vrijwilliger")
                    ]);

                updateStat(

                    0,

                    "Inschrijvingen",

                    inschrijvingen?.length ?? "—",

                    "◎",

                    "Totaal inschrijvingen"
                );

                updateStat(

                    1,

                    "Deelnemers",

                    inschrijvingen
                        ? countParticipants(inschrijvingen)
                        : "—",

                    "♧",

                    "Geregistreerde deelnemers"
                );

                updateStat(

                    2,

                    "Wandelroutes",

                    routes?.length ?? "—",

                    "◇",

                    "Routes in de database"
                );

                updateStat(

                    3,

                    "Vrijwilligers",

                    vrijwilligers?.length ?? "—",

                    "♧",

                    "Geregistreerde vrijwilligers"
                );

                if (recentPanel) {

                    recentPanel.style.display = "";
                }

                if (inschrijvingen) {

                    renderRecentRegistrations(
                        inschrijvingen
                    );

                } else {

                    showTableMessage(
                        "Inschrijvingen niet beschikbaar."
                    );
                }

            } else {

                updateStat(

                    0,

                    "Wandelroutes",

                    routes?.length ?? "—",

                    "◇",

                    "Beschikbare routes"
                );

                updateStat(

                    1,

                    "Diensten",

                    diensten?.length ?? "—",

                    "◷",

                    "Diensten in het inzetschema"
                );

                updateStat(

                    2,

                    "Open plaatsen",

                    diensten
                        ? diensten.reduce(
                            (total, item) =>
                                total + Number(item.open),
                            0
                        )
                        : "—",

                    "♧",

                    "Nog beschikbare plaatsen"
                );

                if (secretaris) {

                    const vragen = await veiligOphalen(
                        "/api/ContactVraag"
                    );

                    const open = vragen

                        ? vragen.filter(vraag =>
                            String(
                                vraag.status || "Nieuw"
                            ).toLowerCase() !==
                            "beantwoord"
                        ).length

                        : "—";

                    updateStat(

                        3,

                        "Openstaande vragen",

                        open,

                        "✉",

                        "Nog te behandelen"
                    );

                } else if (penningmeester) {

                    const transacties = await veiligOphalen(
                        "/api/Transactie"
                    );

                    updateStat(

                        3,

                        "Transacties",

                        transacties?.length ?? "—",

                        "€",

                        "Financiële boekingen"
                    );

                } else if (vrijwilliger) {

                    const persoonlijk = await veiligOphalen(
                        "/api/MijnDiensten/me"
                    );

                    updateStat(

                        3,

                        "Mijn diensten",

                        persoonlijk?.length ?? "—",

                        "✓",

                        "Persoonlijke planning"
                    );
                }
            }

            const labels = rollen.map(rol =>
                rol === "Verkeersregelaars"
                    ? "Verkeersregelaar"
                    : rol
            );

            noticeTitle.textContent =
                "Welkom, " +
                (gebruiker.naam || "gebruiker");

            noticeText.textContent =

                "Je bent ingelogd als " +

                labels.join(" / ") +

                ". Dit dashboard toont gegevens " +

                "die beschikbaar zijn voor jouw rol.";

            if (errors.length) {

                console.error(errors);

                noticeText.textContent +=

                    " Sommige gegevens konden " +

                    "niet worden opgehaald.";
            }

        } catch (error) {

            console.error(error);

            noticeTitle.textContent =
                "Dashboard ophalen mislukt";

            noticeText.textContent =
                error.message;
        }
    }

    loadDashboard();

});
