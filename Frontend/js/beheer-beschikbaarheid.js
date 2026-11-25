
// ==========================================
// AVOND4DAAGSE 2027
// MIJN BESCHIKBAARHEID - BACKEND
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const API_URL =
        "http://localhost:5278/api/Beschikbaarheid/me";

    const form = $("baForm");
    const note = $("baNote");
    const feedback = $("baFeedback");
    const saveButton = $("baSave");
    const restoreButton = $("baRestore");

    const evenings = [
        ...document.querySelectorAll(".ba-evening")
    ];

    const validValues = [
        "beschikbaar",
        "misschien",
        "niet"
    ];

    const labels = {
        beschikbaar: "Beschikbaar",
        misschien: "Misschien",
        niet: "Niet beschikbaar"
    };

    let ready = false;
    let busy = false;

    let savedState = {
        avonden: {},
        toelichting: ""
    };

    // ======================================
    // 1. API
    // ======================================

    async function request(method = "GET", data) {

        const response = await fetch(API_URL, {
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

        if (response.status === 401) {

            throw new Error(
                "Log opnieuw in."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Je hebt geen toegang."
            );
        }

        if (response.status === 404) {

            throw new Error(
                "Er is nog geen vrijwilliger gekoppeld " +
                "aan jouw account. Vraag de voorzitter " +
                "om je account te koppelen."
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
    // 2. FORMULIER LEZEN
    // ======================================

    function readForm() {

        const avonden = {};

        evenings.forEach(evening => {

            const number = evening.dataset.evening;

            const checked = evening.querySelector(
                "input[type=radio]:checked"
            );

            avonden[number] = checked
                ? checked.value
                : "";
        });

        return {
            avonden,
            toelichting: note.value.trim()
        };
    }

    // ======================================
    // 3. FORMULIER INVULLEN
    // ======================================

    function applyState(state) {

        evenings.forEach(evening => {

            const number = evening.dataset.evening;

            const value =
                state.avonden?.[number] || "";

            evening.querySelectorAll(
                "input[type=radio]"
            ).forEach(input => {

                input.checked =
                    input.value === value;
            });
        });

        note.value =
            state.toelichting || "";

        updateStatistics();
    }

    // ======================================
    // 4. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        const state = readForm();

        const values = Object.values(
            state.avonden
        );

        const filled = values.filter(value =>
            validValues.includes(value)
        ).length;

        $("baFilled").textContent =
            filled + " / 4";

        $("baAvailable").textContent =
            values.filter(
                value => value === "beschikbaar"
            ).length;

        $("baMaybe").textContent =
            values.filter(
                value => value === "misschien"
            ).length;

        $("baUnavailable").textContent =
            values.filter(
                value => value === "niet"
            ).length;

        $("baProgressLabel").textContent =
            filled + " van 4 ingevuld";

        $("baProgressFill").style.width =
            (filled / 4 * 100) + "%";

        $("baProgress").setAttribute(
            "aria-valuenow",
            String(filled)
        );

        $("baNoteCount").textContent =
            note.value.length + " / 600 tekens";

        evenings.forEach(evening => {

            const value =
                state.avonden[evening.dataset.evening];

            evening.querySelector(
                ".ba-evening-status"
            ).textContent =
                labels[value] || "Nog niet ingevuld";
        });
    }

    // ======================================
    // 5. FORMULIER BESCHIKBAARHEID
    // ======================================

    function setEnabled(enabled) {

        form.querySelectorAll(
            "input, textarea, button"
        ).forEach(element => {

            element.disabled = !enabled;
        });
    }

    // ======================================
    // 6. GEGEVENS OPHALEN
    // ======================================

    async function loadAvailability() {

        setEnabled(false);

        $("baSavedStatus").textContent =
            "Gegevens ophalen...";

        try {

            savedState = await request();

            applyState(savedState);

            ready = true;

            setEnabled(true);

            $("baSavedStatus").textContent =
                "Beschikbaarheid uit de database geladen";

            feedback.textContent =
                "Je persoonlijke beschikbaarheid is opgehaald.";

        } catch (error) {

            ready = false;

            $("baSavedStatus").textContent =
                "Beschikbaarheid niet beschikbaar";

            feedback.textContent =
                error.message;
        }
    }

    // ======================================
    // 7. OPSLAAN
    // ======================================

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (!ready || busy) return;

        busy = true;

        const state = readForm();

        setEnabled(false);

        feedback.textContent =
            "Beschikbaarheid opslaan...";

        try {

            savedState = await request(
                "PUT",
                state
            );

            applyState(savedState);

            $("baSavedStatus").textContent =
                "Opgeslagen in de database";

            feedback.textContent =
                "Je beschikbaarheid is succesvol opgeslagen.";

        } catch (error) {

            feedback.textContent =
                "Opslaan mislukt: " + error.message;

        } finally {

            busy = false;

            setEnabled(ready);
        }
    });

    // ======================================
    // 8. HERSTELLEN EN WIJZIGEN
    // ======================================

    restoreButton.addEventListener("click", () => {

        if (!ready || busy) return;

        applyState(savedState);

        $("baSavedStatus").textContent =
            "Opgeslagen keuzes hersteld";

        feedback.textContent =
            "De laatst opgeslagen gegevens zijn hersteld.";
    });

    form.addEventListener("input", () => {

        updateStatistics();

        if (ready) {

            $("baSavedStatus").textContent =
                "Niet-opgeslagen wijzigingen";
        }
    });

    // Avond opnieuw onbeantwoord kunnen maken.
    evenings.forEach(evening => {

        const clearButton =
            document.createElement("button");

        clearButton.type = "button";

        clearButton.className =
            "ba-button ba-button-light";

        clearButton.textContent =
            "Keuze wissen";

        clearButton.addEventListener("click", () => {

            if (!ready || busy) return;

            evening.querySelectorAll(
                "input[type=radio]"
            ).forEach(input => {

                input.checked = false;
            });

            updateStatistics();

            $("baSavedStatus").textContent =
                "Niet-opgeslagen wijzigingen";
        });

        evening.appendChild(clearButton);
    });

    // ======================================
    // 9. INTERFACE TEKSTEN
    // ======================================

    const notice = document.querySelector(
        ".bm-notice"
    );

    notice.querySelector("strong").textContent =
        "Beschikbaarheid is nog geen inplanning";

    notice.querySelector("p").textContent =
        "Je beschikbaarheid wordt gekoppeld aan " +
        "je persoonlijke vrijwilligersaccount. " +
        "De definitieve evenementdatums zijn nog " +
        "niet bevestigd.";

    const tag = document.querySelector(
        ".bm-demo-tag"
    );

    if (tag) {

        tag.textContent =
            "Persoonlijke beschikbaarheid";
    }

    const saveText = document.querySelector(
        ".ba-save-area p"
    );

    if (saveText) {

        saveText.textContent =
            "Je keuzes worden opgeslagen in de database.";
    }

    // Verwijder fictieve persoonlijke diensten.
    const shiftsPanel = $("baShiftsTitle")
        ?.closest(".ba-panel");

    if (shiftsPanel) {

        const tbody =
            shiftsPanel.querySelector("tbody");

        if (tbody) {

            tbody.replaceChildren();

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 5;

            cell.textContent =
                "Persoonlijke taaktoewijzingen zijn " +
                "nog niet gekoppeld.";

            row.appendChild(cell);

            tbody.appendChild(row);
        }

        const eyebrow = shiftsPanel.querySelector(
            ".bm-eyebrow"
        );

        if (eyebrow) {

            eyebrow.textContent =
                "PERSOONLIJKE PLANNING";
        }

        const description = shiftsPanel.querySelector(
            ".ba-panel-header div > p:last-child"
        );

        if (description) {

            description.textContent =
                "Hier komen later jouw toegewezen diensten.";
        }

        const tableNote = shiftsPanel.querySelector(
            ".ba-table-note"
        );

        if (tableNote) {

            tableNote.textContent =
                "Het inzetschema is nog niet gekoppeld " +
                "aan persoonlijke taaktoewijzingen.";
        }
    }

    const bottomInfo = document.querySelector(
        ".ba-bottom-info p"
    );

    if (bottomInfo) {

        bottomInfo.textContent =
            "De organisatie kan je beschikbaarheid bekijken " +
            "via vrijwilligersbeheer. De koppeling met " +
            "persoonlijke diensten volgt later.";
    }

    const footer = document.querySelector(
        ".bm-content-footer"
    );

    if (footer) {

        footer.textContent =
            "Avond4daagse 2027 · Mijn beschikbaarheid";
    }

    // ======================================
    // 10. START
    // ======================================

    loadAvailability();

});
