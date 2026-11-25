
// ==========================================
// AVOND4DAAGSE 2027
// MIJN PERSOONLIJKE DIENSTEN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL =
        "http://localhost:5278/api/MijnDiensten/me";

    const panel = document
        .getElementById("baShiftsTitle")
        ?.closest(".ba-panel");

    if (!panel) return;

    const tbody = panel.querySelector("tbody");

    if (!tbody) return;

    const eyebrow = panel.querySelector(
        ".bm-eyebrow"
    );

    const description = panel.querySelector(
        ".ba-panel-header div > p:last-child"
    );

    const tableNote = panel.querySelector(
        ".ba-table-note"
    );

    const bottomInfo = document.querySelector(
        ".ba-bottom-info p"
    );

    // ======================================
    // 1. TEKSTEN BIJWERKEN
    // ======================================

    if (eyebrow) {

        eyebrow.textContent =
            "PERSOONLIJKE PLANNING";
    }

    if (description) {

        description.textContent =
            "Hier zie je de diensten waarvoor " +
            "de organisatie jou heeft ingepland.";
    }

    if (tableNote) {

        tableNote.textContent =
            "Je planning wordt rechtstreeks uit " +
            "het inzetschema opgehaald. Locaties " +
            "en evenementdatums zijn voorlopig.";
    }

    if (bottomInfo) {

        bottomInfo.textContent =
            "De organisatie bekijkt jouw beschikbaarheid " +
            "en kan je aan een dienst koppelen. " +
            "Toegewezen diensten verschijnen automatisch " +
            "in jouw persoonlijke planning.";
    }

    // Vrijwilligers hebben geen toegang
    // tot het volledige beheer-inzetschema.

    const oldLink = panel.querySelector(
        'a[href="inzetschema.html"]'
    );

    if (oldLink) {

        oldLink.href = "draaiboek.html";

        oldLink.textContent =
            "Bekijk mijn taken ↗";
    }

    // ======================================
    // 2. VERNIEUWKNOP
    // ======================================

    const refreshButton =
        document.createElement("button");

    refreshButton.type = "button";

    refreshButton.className =
        "ba-button ba-button-light";

    refreshButton.textContent =
        "Planning vernieuwen";

    refreshButton.style.marginTop = "12px";

    panel.appendChild(refreshButton);

    // ======================================
    // 3. TABEL HULPFUNCTIES
    // ======================================

    function showMessage(message) {

        tbody.replaceChildren();

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = message;

        row.appendChild(cell);

        tbody.appendChild(row);
    }

    function createCell(value) {

        const cell = document.createElement("td");

        cell.textContent = value;

        return cell;
    }

    // ======================================
    // 4. DIENSTEN WEERGEVEN
    // ======================================

    function renderShifts(shifts) {

        tbody.replaceChildren();

        if (!shifts.length) {

            showMessage(
                "Je bent nog niet ingepland voor een dienst."
            );

            return;
        }

        shifts.forEach(shift => {

            const row =
                document.createElement("tr");

            const nameCell =
                document.createElement("td");

            const name =
                document.createElement("strong");

            name.textContent = shift.naam;

            nameCell.appendChild(name);

            const statusCell =
                document.createElement("td");

            const status =
                document.createElement("span");

            status.className = "ba-demo-badge";

            status.textContent =
                shift.status || "Ingepland";

            status.style.backgroundColor =
                "#e2f2e7";

            status.style.color =
                "#24694b";

            statusCell.appendChild(status);

            row.append(

                createCell(
                    "Avond " + shift.avond
                ),

                nameCell,

                createCell(
                    shift.tijd
                ),

                createCell(
                    shift.locatie ||
                    "Nog niet bevestigd"
                ),

                statusCell
            );

            tbody.appendChild(row);
        });
    }

    // ======================================
    // 5. BACKENDGEGEVENS OPHALEN
    // ======================================

    async function loadShifts() {

        refreshButton.disabled = true;

        showMessage(
            "Jouw diensten worden opgehaald..."
        );

        try {

            const response = await fetch(API_URL, {

                credentials: "include",

                cache: "no-store"
            });

            if (response.status === 401) {

                throw new Error(
                    "Log opnieuw in."
                );
            }

            if (response.status === 403) {

                throw new Error(
                    "Je hebt geen toegang tot deze planning."
                );
            }

            if (response.status === 404) {

                throw new Error(
                    "Er is geen vrijwilliger gekoppeld " +
                    "aan jouw account."
                );
            }

            if (!response.ok) {

                throw new Error(
                    "Planning ophalen mislukt."
                );
            }

            const shifts = await response.json();

            if (!Array.isArray(shifts)) {

                throw new Error(
                    "Ongeldige planningsgegevens."
                );
            }

            renderShifts(shifts);

        } catch (error) {

            console.error(error);

            showMessage(error.message);

        } finally {

            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener(
        "click",
        loadShifts
    );

    loadShifts();

});
