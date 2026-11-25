
// ==========================================
// AVOND4DAAGSE 2027
// VRIJWILLIGERS - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const API_URL =
        "http://localhost:5278/api/Vrijwilliger";

    const body = $("bvTableBody");

    if (!body) return;

    const search = $("bvSearch");
    const roleFilter = $("bvRole");
    const statusFilter = $("bvStatus");
    const filters = $("bvFilters");
    const feedback = $("bvFeedback");
    const exportButton = $("bvExport");

    const detailDialog = $("bvDialog");

    let vrijwilligers = [];
    let visibleVolunteers = [];
    let selected = null;
    let editingId = null;
    let busy = false;
    let ready = false;

    // ======================================
    // 1. API
    // ======================================

    async function request(path = "", method = "GET", data) {

        let response;

        try {

            response = await fetch(
                API_URL + path,
                {
                    method,
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: data === undefined
                        ? undefined
                        : JSON.stringify(data)
                }
            );

        } catch {

            throw new Error(
                "Geen verbinding met de backend."
            );
        }

        if (response.status === 401) {

            throw new Error(
                "Log opnieuw in."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "De rol Voorzitter is vereist."
            );
        }

        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                response.status,
                errorText
            );

            throw new Error(
                "API-fout: HTTP " + response.status
            );
        }

        if (response.status === 204) return null;

        return await response.json();
    }

    // ======================================
    // 2. GEGEVENS NORMALISEREN
    // ======================================

    function normalize(person) {

        return {
            id: person.vrijwilligersId,
            voornaam: person.voornaam || "",
            achternaam: person.achternaam || "",
            naam: [
                person.voornaam,
                person.achternaam
            ].filter(Boolean).join(" "),
            telefoon: person.telefoonnummer || "",
            rol: person.voorkeursrol || "",
            beschikbaar: person.beschikbaarheid || "",
            status: person.status || "",
            inzet: person.inzetting || ""
        };
    }

    // ======================================
    // 3. VRIJWILLIGERS OPHALEN
    // ======================================

    async function loadVolunteers() {

        ready = false;
        addButton.disabled = true;
        exportButton.disabled = true;

        $("bvTotal").textContent = "—";
        $("bvConfirmed").textContent = "—";
        $("bvInvited").textContent = "—";

        showMessage("Vrijwilligers worden geladen...");

        try {

            const data = await request();

            if (!Array.isArray(data)) {

                throw new Error(
                    "Onverwacht API-antwoord."
                );
            }

            vrijwilligers = data.map(normalize);

            ready = true;

            updateFilters();
            updateStatistics();
            renderVolunteers();

            noticeTitle.textContent =
                "Vrijwilligers verbonden met de database";

            noticeText.textContent =
                "Vrijwilligers worden centraal opgeslagen. " +
                "Toevoegen, bewerken en verwijderen " +
                "worden verwerkt door de backend. " +
                "Het aparte inzetschema is voorlopig een demo.";

            return true;

        } catch (error) {

            vrijwilligers = [];
            visibleVolunteers = [];

            showMessage(error.message);

            noticeTitle.textContent =
                "Vrijwilligers ophalen mislukt";

            noticeText.textContent =
                error.message;

            return false;

        } finally {

            addButton.disabled = !ready;
        }
    }

    // ======================================
    // 4. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        $("bvTotal").textContent =
            vrijwilligers.length;

        $("bvConfirmed").textContent =
            vrijwilligers.filter(person =>
                person.status.toLowerCase() === "bevestigd"
            ).length;

        $("bvInvited").textContent =
            vrijwilligers.filter(person =>
                person.status.toLowerCase() === "uitgenodigd"
            ).length;
    }

    // ======================================
    // 5. FILTERS
    // ======================================

    function updateSelect(select, title, values) {

        const current = select.value;

        select.replaceChildren(
            new Option(title, "")
        );

        [...new Set(values)]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, "nl"))
            .forEach(value => {

                select.add(
                    new Option(value, value)
                );
            });

        select.value = current;

        if (select.selectedIndex === -1) {

            select.value = "";
        }
    }

    function updateFilters() {

        updateSelect(
            roleFilter,
            "Alle rollen",
            vrijwilligers.map(person => person.rol)
        );

        updateSelect(
            statusFilter,
            "Alle statussen",
            vrijwilligers.map(person => person.status)
        );
    }

    function filterVolunteers() {

        const query = search.value
            .trim()
            .toLowerCase();

        return vrijwilligers.filter(person => {

            const text = [
                person.id,
                person.naam,
                person.telefoon,
                person.rol
            ].join(" ").toLowerCase();

            return (
                text.includes(query) &&
                (
                    !roleFilter.value ||
                    person.rol === roleFilter.value
                ) &&
                (
                    !statusFilter.value ||
                    person.status === statusFilter.value
                )
            );
        });
    }

    // ======================================
    // 6. TABEL
    // ======================================

    function makeCell(value, className = "") {

        const td = document.createElement("td");

        td.textContent = value || "—";
        td.className = className;

        return td;
    }

    function showMessage(message) {

        body.replaceChildren();

        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 7;
        td.className = "bv-empty-row";
        td.textContent = message;

        tr.appendChild(td);
        body.appendChild(tr);

        $("bvResultCount").textContent = message;
    }

    function createRow(person) {

        const tr = document.createElement("tr");

        tr.append(
            makeCell("V-" + person.id, "bv-code"),
            makeCell(person.naam, "bv-name"),
            makeCell(person.rol),
            makeCell(person.beschikbaar)
        );

        const statusCell =
            document.createElement("td");

        const badge =
            document.createElement("span");

        badge.className =
            "bv-badge " +
            (
                person.status.toLowerCase() === "bevestigd"
                    ? "bv-badge-confirmed"
                    : "bv-badge-invited"
            );

        badge.textContent =
            person.status || "Onbekend";

        statusCell.appendChild(badge);

        tr.append(
            statusCell,
            makeCell(person.inzet)
        );

        const actionCell =
            document.createElement("td");

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "bv-detail-button";
        button.textContent = "Bekijk";

        button.addEventListener("click", () => {

            showVolunteer(person);
        });

        actionCell.appendChild(button);

        tr.appendChild(actionCell);

        return tr;
    }

    function renderVolunteers() {

        if (!ready) return;

        visibleVolunteers = filterVolunteers();

        body.replaceChildren();

        if (!visibleVolunteers.length) {

            showMessage(
                "Geen vrijwilligers gevonden."
            );

        } else {

            visibleVolunteers.forEach(person => {

                body.appendChild(
                    createRow(person)
                );
            });
        }

        $("bvResultCount").textContent =
            visibleVolunteers.length +
            " van " +
            vrijwilligers.length +
            " vrijwilligers getoond";

        exportButton.disabled =
            visibleVolunteers.length === 0;
    }

    // ======================================
    // 7. DETAILVENSTER
    // ======================================

    function showVolunteer(person) {

        selected = person;

        $("bvDetailId").textContent =
            "V-" + person.id;

        $("bvDetailName").textContent =
            person.naam || "—";

        $("bvDetailPhone").textContent =
            person.telefoon || "—";

        $("bvDetailRole").textContent =
            person.rol || "—";

        $("bvDetailAvailable").textContent =
            person.beschikbaar || "—";

        $("bvDetailStatus").textContent =
            person.status || "Onbekend";

        $("bvDetailShift").textContent =
            person.inzet || "Nog niet ingepland";

        detailDialog.showModal();
    }

    $("bvCloseDialog").addEventListener(
        "click",
        () => detailDialog.close()
    );

    $("bvCloseBottom").addEventListener(
        "click",
        () => detailDialog.close()
    );

    // ======================================
    // 8. KNOPPEN TOEVOEGEN
    // ======================================

    function makeButton(text, className, action) {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = className;
        button.textContent = text;

        button.addEventListener(
            "click",
            action
        );

        return button;
    }

    const addButton = makeButton(
        "+ Vrijwilliger toevoegen",
        "bv-button bv-button-primary",
        () => openForm()
    );

    addButton.disabled = true;

    exportButton.before(addButton);

    const editButton = makeButton(
        "Bewerken",
        "bv-button bv-button-light",
        () => {

            if (!selected || busy) return;

            detailDialog.close();

            openForm(selected);
        }
    );

    const deleteButton = makeButton(
        "Verwijderen",
        "bv-button bv-button-light",
        deleteVolunteer
    );

    $("bvCloseBottom").before(
        editButton,
        deleteButton
    );

    // ======================================
    // 9. TOEVOEGEN / BEWERKEN FORMULIER
    // ======================================

    const formDialog =
        document.createElement("dialog");

    formDialog.className = "bv-dialog";

    formDialog.setAttribute(
        "aria-labelledby",
        "bvFormTitle"
    );

    formDialog.innerHTML = `
        <div class="bv-dialog-heading">
            <div>
                <p class="bm-eyebrow">VRIJWILLIGER</p>
                <h2 id="bvFormTitle">Vrijwilliger toevoegen</h2>
            </div>

            <button type="button"
                    id="bvFormClose"
                    class="bv-dialog-close"
                    aria-label="Sluiten">×</button>
        </div>

        <form id="bvVolunteerForm">

            <div style="display:grid;gap:14px;">

                <label>
                    Voornaam
                    <input id="bvFirstName"
                           type="text"
                           maxlength="50"
                           required>
                </label>

                <label>
                    Achternaam
                    <input id="bvLastName"
                           type="text"
                           maxlength="50"
                           required>
                </label>

                <label>
                    Telefoonnummer
                    <input id="bvPhone"
                           type="tel"
                           required>
                </label>

                <label>
                    Voorkeursrol
                    <input id="bvPreferredRole"
                           type="text"
                           list="bvRoleOptions">

                    <datalist id="bvRoleOptions">
                        <option value="Verkeersregelaar">
                        <option value="Controlepost">
                        <option value="Startbureau">
                        <option value="Routebegeleider">
                        <option value="EHBO">
                        <option value="Finishteam">
                    </datalist>
                </label>

                <label>
                    Beschikbaarheid
                    <input id="bvAvailability"
                           type="text"
                           placeholder="Bijv. Avond 1 en 3">
                </label>

                <label id="bvEditStatusWrap">
                    Status
                    <input id="bvEditStatus"
                           type="text"
                           list="bvStatusOptions">

                    <datalist id="bvStatusOptions">
                        <option value="Bevestigd">
                        <option value="Uitgenodigd">
                    </datalist>
                </label>

                <label id="bvAssignmentWrap">
                    Inzet
                    <input id="bvAssignment"
                           type="text"
                           placeholder="Bijv. Avond 2, startbureau">
                </label>

                <p id="bvFormNote"></p>

                <p id="bvFormFeedback"
                   role="status"
                   aria-live="polite"></p>

                <div style="display:flex;gap:10px;flex-wrap:wrap;">

                    <button type="button"
                            id="bvFormCancel"
                            class="bv-button bv-button-light">
                        Annuleren
                    </button>

                    <button type="submit"
                            id="bvFormSave"
                            class="bv-button bv-button-primary">
                        Vrijwilliger opslaan
                    </button>

                </div>

            </div>

        </form>
    `;

    document.body.appendChild(formDialog);

    formDialog.querySelectorAll("input").forEach(input => {

        Object.assign(input.style, {
            display: "block",
            width: "100%",
            padding: "10px 12px",
            marginTop: "6px",
            border: "1px solid #cedbd2",
            borderRadius: "8px",
            boxSizing: "border-box",
            font: "inherit"
        });
    });

    function openForm(person = null) {

        if (!ready || busy) return;

        $("bvVolunteerForm").reset();

        editingId = person ? person.id : null;

        $("bvFormTitle").textContent = person
            ? "Vrijwilliger bewerken"
            : "Vrijwilliger toevoegen";

        $("bvFirstName").value =
            person?.voornaam || "";

        $("bvLastName").value =
            person?.achternaam || "";

        $("bvFirstName").readOnly = Boolean(person);
        $("bvLastName").readOnly = Boolean(person);

        $("bvPhone").value =
            person?.telefoon || "";

        $("bvPreferredRole").value =
            person?.rol || "";

        $("bvAvailability").value =
            person?.beschikbaar || "";

        $("bvEditStatus").value =
            person?.status || "";

        $("bvAssignment").value =
            person?.inzet || "";

        $("bvEditStatusWrap").hidden = !person;
        $("bvAssignmentWrap").hidden = !person;

        $("bvEditStatus").disabled = !person;
        $("bvAssignment").disabled = !person;

        $("bvFormNote").textContent = person
            ? "Naam wijzigen wordt nog niet ondersteund " +
              "door de backend."
            : "Status en inzet kunnen na het toevoegen " +
              "worden aangepast.";

        $("bvFormFeedback").textContent = "";

        formDialog.showModal();
    }

    function closeForm() {

        if (!busy) {

            formDialog.close();

            editingId = null;
        }
    }

    $("bvFormClose").addEventListener(
        "click", closeForm
    );

    $("bvFormCancel").addEventListener(
        "click", closeForm
    );

    formDialog.addEventListener("cancel", event => {

        if (busy) event.preventDefault();
    });

    // ======================================
    // 10. POST EN PUT
    // ======================================

    $("bvVolunteerForm").addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (busy) return;

            busy = true;

            $("bvFormSave").disabled = true;
            $("bvFormFeedback").textContent = "";

            try {

                const payload = {
                    telefoonnummer:
                        $("bvPhone").value.trim(),

                    voorkeursrol:
                        $("bvPreferredRole").value.trim(),

                    beschikbaarheid:
                        $("bvAvailability").value.trim()
                };

                if (!payload.telefoonnummer) {

                    throw new Error(
                        "Vul een telefoonnummer in."
                    );
                }

                let message;

                if (editingId !== null) {

                    // PUT

                    payload.status =
                        $("bvEditStatus").value.trim();

                    payload.inzetting =
                        $("bvAssignment").value.trim();

                    await request(
                        "/" + editingId,
                        "PUT",
                        payload
                    );

                    message =
                        "Vrijwilliger bijgewerkt.";

                } else {

                    // POST

                    payload.voornaam =
                        $("bvFirstName").value.trim();

                    payload.achternaam =
                        $("bvLastName").value.trim();

                    if (
                        !payload.voornaam ||
                        !payload.achternaam
                    ) {

                        throw new Error(
                            "Vul voor- en achternaam in."
                        );
                    }

                    await request(
                        "",
                        "POST",
                        payload
                    );

                    message =
                        "Vrijwilliger toegevoegd.";
                }

                formDialog.close();

                editingId = null;

                filters.reset();

                const reloaded =
                    await loadVolunteers();

                feedback.textContent = reloaded
                    ? message
                    : message +
                      " Het vernieuwen van het overzicht is mislukt.";

            } catch (error) {

                $("bvFormFeedback").textContent =
                    error.message;

            } finally {

                busy = false;

                $("bvFormSave").disabled = false;
            }
        }
    );

    // ======================================
    // 11. DELETE
    // ======================================

    async function deleteVolunteer() {

        if (!selected || busy) return;

        const person = selected;

        const confirmed = window.confirm(
            'Wil je "' + person.naam +
            '" definitief verwijderen uit de database?'
        );

        if (!confirmed) return;

        busy = true;

        editButton.disabled = true;
        deleteButton.disabled = true;

        try {

            await request(
                "/" + person.id,
                "DELETE"
            );

            detailDialog.close();

            selected = null;

            const reloaded =
                await loadVolunteers();

            feedback.textContent = reloaded
                ? "Vrijwilliger verwijderd."
                : "Vrijwilliger verwijderd, maar het " +
                  "overzicht kon niet worden vernieuwd.";

        } catch (error) {

            alert(
                "Verwijderen mislukt: " +
                error.message
            );

        } finally {

            busy = false;

            editButton.disabled = false;
            deleteButton.disabled = false;
        }
    }

    // ======================================
    // 12. CSV EXPORT
    // ======================================

    function csvValue(value) {

        let text = String(value ?? "");

        if (/^\s*[=+\-@]/.test(text)) {

            text = "'" + text;
        }

        return '"' +
            text.replace(/"/g, '""') +
            '"';
    }

    exportButton.addEventListener("click", () => {

        if (!visibleVolunteers.length) return;

        const headings = [
            "Nummer",
            "Naam",
            "Telefoon",
            "Voorkeursrol",
            "Beschikbaarheid",
            "Status",
            "Inzet"
        ];

        const rows = visibleVolunteers.map(person => [
            person.id,
            person.naam,
            person.telefoon,
            person.rol,
            person.beschikbaar,
            person.status,
            person.inzet
        ]);

        const content = [
            headings,
            ...rows
        ].map(row =>
            row.map(csvValue).join(";")
        ).join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + content],
            {
                type: "text/csv;charset=utf-8"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download =
            "avond4daagse-vrijwilligers.csv";

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );

        feedback.textContent =
            visibleVolunteers.length +
            " vrijwilligers geëxporteerd.";
    });

    // ======================================
    // 13. FILTEREVENTS
    // ======================================

    search.addEventListener(
        "input", renderVolunteers
    );

    roleFilter.addEventListener(
        "change", renderVolunteers
    );

    statusFilter.addEventListener(
        "change", renderVolunteers
    );

    filters.addEventListener("submit", event => {

        event.preventDefault();
    });

    filters.addEventListener("reset", () => {

        setTimeout(renderVolunteers, 0);
    });

    // ======================================
    // 14. INTERFACE TEKSTEN
    // ======================================

    const notice = document.querySelector(
        ".bm-notice"
    );

    const noticeTitle =
        notice.querySelector("strong");

    const noticeText =
        notice.querySelector("p");

    noticeTitle.textContent =
        "Vrijwilligers ophalen";

    noticeText.textContent =
        "De databasegegevens worden geladen.";

    $("bvTotal").parentElement
        .querySelector("span").textContent =
            "Totaal vrijwilligers";

    $("bvConfirmed").parentElement
        .querySelector("small").textContent =
            "Bevestigde vrijwilligers";

    document.querySelectorAll(
        ".bv-table th, .bv-details dt"
    ).forEach(element => {

        if (
            element.textContent.trim() ===
            "Voorbeeldinzet"
        ) {

            element.textContent = "Inzet";
        }
    });

    const footer = document.querySelector(
        ".bm-content-footer"
    );

    if (footer) {

        footer.textContent =
            "Avond4daagse 2027 · Vrijwilligersbeheer";
    }

    // ======================================
    // 15. START
    // ======================================

    loadVolunteers();

});
