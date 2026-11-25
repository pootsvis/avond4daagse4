
// ==========================================
// AVOND4DAAGSE 2027
// DASHBOARD - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5278";

    const stats = document.querySelectorAll(".bm-stat-card");

    const tableBody = document.querySelector(
        ".bm-table tbody"
    );

    const notice = document.querySelector(".bm-notice");
    const noticeTitle = notice.querySelector("strong");
    const noticeText = notice.querySelector("p");

    const numberFormat = new Intl.NumberFormat("nl-NL");

    // ======================================
    // 1. API VERZOEKEN
    // ======================================

    async function getData(path) {

        const response = await fetch(
            API_URL + path,
            {
                method: "GET",
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
                "Je hebt geen toegang tot deze gegevens."
            );
        }

        if (!response.ok) {

            throw new Error(
                "API-fout: HTTP " + response.status
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "Onverwacht antwoord van de backend."
            );
        }

        return data;
    }

    // ======================================
    // 2. STATISTIEKEN WEERGEVEN
    // ======================================

    function updateStat(index, label, value, icon, description) {

        const card = stats[index];

        if (!card) return;

        card.querySelector(
            ".bm-stat-head > span:first-child"
        ).textContent = label;

        card.querySelector(
            ".bm-stat-icon"
        ).textContent = icon;

        card.querySelector("strong").textContent =
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

    // ======================================
    // 3. TOTAAL DEELNEMERS
    // ======================================

    function countParticipants(inschrijvingen) {

        return inschrijvingen.reduce(
            (total, inschrijving) => {

                const aantal =
                    inschrijving.aantalDeelnemers;

                if (
                    aantal != null &&
                    Number.isFinite(Number(aantal)) &&
                    Number(aantal) >= 0
                ) {

                    return total + Number(aantal);
                }

                return total + (
                    Array.isArray(inschrijving.deelnemers)
                        ? inschrijving.deelnemers.length
                        : 0
                );

            },
            0
        );
    }

    // ======================================
    // 4. CONTACTVRAGEN
    // ======================================

    function countOpenQuestions(contactvragen) {

        return contactvragen.filter(vraag => {

            const status = String(
                vraag.status || "Nieuw"
            ).trim().toLowerCase();

            return status !== "beantwoord";

        }).length;
    }

    // ======================================
    // 5. RECENTE INSCHRIJVINGEN
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

    function renderRecentRegistrations(inschrijvingen) {

        tableBody.replaceChildren();

        if (!inschrijvingen.length) {

            showTableMessage(
                "Er zijn nog geen inschrijvingen."
            );

            return;
        }

        const recent = [...inschrijvingen]
            .sort((a, b) => {

                const dateA =
                    Date.parse(a.inschrijfdatum) || 0;

                const dateB =
                    Date.parse(b.inschrijfdatum) || 0;

                return dateB - dateA ||
                    Number(b.inschrijvingId) -
                    Number(a.inschrijvingId);

            })
            .slice(0, 5);

        recent.forEach(inschrijving => {

            const row = document.createElement("tr");

            const nameCell =
                document.createElement("td");

            const distanceCell =
                document.createElement("td");

            const statusCell =
                document.createElement("td");

            const statusBadge =
                document.createElement("span");

            const deelnemers = Array.isArray(
                inschrijving.deelnemers
            )
                ? inschrijving.deelnemers
                : [];

            const names = deelnemers.map(deelnemer =>
                [
                    deelnemer.voornaam,
                    deelnemer.achternaam
                ].filter(Boolean).join(" ").trim()
            ).filter(Boolean);

            nameCell.textContent = names.length
                ? names.join(", ")
                : "Inschrijving #" +
                  inschrijving.inschrijvingId;

            const afstand =
                Number(inschrijving.afstandKm);

            distanceCell.textContent = afstand > 0
                ? afstand + " km"
                : "—";

            const status = String(
                inschrijving.status || "Onbekend"
            );

            statusBadge.className =
                "bm-status " +
                (
                    status.toLowerCase() === "betaald"
                        ? "bm-paid"
                        : "bm-pending"
                );

            statusBadge.textContent = status;

            statusCell.appendChild(statusBadge);

            row.append(
                nameCell,
                distanceCell,
                statusCell
            );

            tableBody.appendChild(row);
        });
    }

    // ======================================
    // 6. DEMOTEKSTEN VERVANGEN
    // ======================================

    function prepareDashboard() {

        const tag = document.querySelector(
            ".bm-demo-tag"
        );

        if (tag) {

            tag.textContent = "Databaseoverzicht";
        }

        const caption = document.querySelector(
            ".bm-section-caption"
        );

        if (caption) {

            caption.textContent = "Actuele gegevens";
        }

        const recentPanel = tableBody.closest(
            ".bm-panel"
        );

        const eyebrow = recentPanel.querySelector(
            ".bm-eyebrow"
        );

        if (eyebrow) {

            eyebrow.textContent =
                "LAATSTE INSCHRIJVINGEN";
        }

        const panelNote = recentPanel.querySelector(
            ".bm-panel-note"
        );

        if (panelNote) {

            panelNote.textContent =
                "De vijf meest recente inschrijvingen " +
                "uit de database.";
        }

        const footer = document.querySelector(
            ".bm-content-footer"
        );

        if (footer) {

            footer.textContent =
                "Avond4daagse 2027 · Beheeromgeving";
        }

        noticeTitle.textContent =
            "Dashboardgegevens ophalen";

        noticeText.textContent =
            "De actuele gegevens worden geladen.";

        updateStat(
            0, "Inschrijvingen", "—",
            "◎", "Gegevens laden"
        );

        updateStat(
            1, "Deelnemers", "—",
            "♧", "Gegevens laden"
        );

        updateStat(
            2, "Wandelroutes", "—",
            "◇", "Gegevens laden"
        );

        updateStat(
            3, "Openstaande vragen", "—",
            "✉", "Gegevens laden"
        );

        showTableMessage(
            "Inschrijvingen worden opgehaald..."
        );
    }

    // ======================================
    // 7. DASHBOARD LADEN
    // ======================================

    async function loadDashboard() {

        prepareDashboard();

        const results = await Promise.allSettled([
            getData("/api/Inschrijving"),
            getData("/api/Route"),
            getData("/api/ContactVraag")
        ]);

        const [
            inschrijvingenResult,
            routesResult,
            contactvragenResult
        ] = results;

        const errors = [];

        // INSCHRIJVINGEN EN DEELNEMERS

        if (inschrijvingenResult.status === "fulfilled") {

            const inschrijvingen =
                inschrijvingenResult.value;

            updateStat(
                0,
                "Inschrijvingen",
                inschrijvingen.length,
                "◎",
                "Totaal inschrijvingen"
            );

            updateStat(
                1,
                "Deelnemers",
                countParticipants(inschrijvingen),
                "♧",
                "Totaal geregistreerde deelnemers"
            );

            renderRecentRegistrations(inschrijvingen);

        } else {

            updateStat(
                0, "Inschrijvingen", "—",
                "◎", "Niet beschikbaar"
            );

            updateStat(
                1, "Deelnemers", "—",
                "♧", "Niet beschikbaar"
            );

            showTableMessage(
                "Inschrijvingen konden niet worden opgehaald."
            );

            errors.push(
                "Inschrijvingen: " +
                inschrijvingenResult.reason.message
            );
        }

        // WANDELROUTES

        if (routesResult.status === "fulfilled") {

            updateStat(
                2,
                "Wandelroutes",
                routesResult.value.length,
                "◇",
                "Routes in de database"
            );

        } else {

            updateStat(
                2, "Wandelroutes", "—",
                "◇", "Niet beschikbaar"
            );

            errors.push(
                "Routes: " +
                routesResult.reason.message
            );
        }

        // CONTACTVRAGEN

        if (contactvragenResult.status === "fulfilled") {

            updateStat(
                3,
                "Openstaande vragen",
                countOpenQuestions(
                    contactvragenResult.value
                ),
                "✉",
                "Nog te behandelen"
            );

        } else {

            updateStat(
                3, "Openstaande vragen", "—",
                "✉", "Niet beschikbaar"
            );

            errors.push(
                "Contactvragen: " +
                contactvragenResult.reason.message
            );
        }

        // VERBINDINGSSTATUS

        if (errors.length === 0) {

            noticeTitle.textContent =
                "Dashboard verbonden met de database";

            noticeText.textContent =
                "De cijfers en recente inschrijvingen " +
                "zijn rechtstreeks opgehaald uit PostgreSQL. " +
                "Het overzicht wordt bijgewerkt wanneer " +
                "je deze pagina opent of vernieuwt.";

        } else {

            noticeTitle.textContent =
                "Niet alle gegevens zijn beschikbaar";

            noticeText.textContent =
                errors.join(" | ");
        }
    }

    // ======================================
    // 8. START
    // ======================================

    loadDashboard();

});
