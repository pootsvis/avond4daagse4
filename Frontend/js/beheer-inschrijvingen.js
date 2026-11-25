
// ==========================================
// AVOND4DAAGSE 2027
// INSCHRIJVINGENBEHEER MET DEELNEMERS
// ECHTE BACKEND- EN DATABASEKOPPELING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5278/api/Inschrijving";

    const $ = id => document.getElementById(id);

    const filterForm = $("biFilters");
    const searchInput = $("biSearch");
    const distanceFilter = $("biDistance");
    const statusFilter = $("biStatus");
    const tableBody = $("biTableBody");
    const selectAll = $("biSelectAll");
    const selectionText = $("biSelectionText");
    const cancelButton = $("biCancelSelected");
    const exportButton = $("biExportCSV");
    const prevButton = $("biPrev");
    const nextButton = $("biNext");
    const currentPageLabel = $("biCurrentPage");
    const paginationText = $("biPaginationText");
    const feedback = $("biFeedback");
    const detailDialog = $("biDetailDialog");

    let inschrijvingen = [];
    let currentPage = 1;
    let currentPageRows = [];

    const rowsPerPage = 5;
    const selected = new Set();


    // ======================================
    // 1. API VERBINDING
    // ======================================

    async function apiRequest(path = "", options = {}) {

        const response = await fetch(API_URL + path, {
            credentials: "include",
            cache: "no-store",
            ...options
        });

        if (response.status === 401) {

            window.location.replace("login.html");

            throw new Error("Log opnieuw in.");
        }

        if (response.status === 403) {

            throw new Error(
                "Alleen de rol Voorzitter mag " +
                "inschrijvingen bekijken en aanpassen."
            );
        }

        if (!response.ok) {

            throw new Error(
                "API-fout: HTTP " + response.status
            );
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }


    // ======================================
    // 2. DATABASEGEGEVENS OMZETTEN
    // ======================================

    function normaliseer(data) {

        const deelnemers = (
            Array.isArray(data.deelnemers)
                ? data.deelnemers
                : []
        ).map(d => ({

            naam: [
                d.voornaam,
                d.achternaam
            ].filter(Boolean).join(" ").trim(),

            school:
                d.deelname?.school ||
                d.deelname?.groep ||
                "",

            geboortedatum:
                d.deelname?.geboortedatum || "",

            keer:
                d.deelname?.hoeveelheidKeer ?? null
        }));

        const scholen = [
            ...new Set(
                deelnemers
                    .map(d => d.school)
                    .filter(Boolean)
            )
        ];

        const afstandKm =
            Number(data.afstandKm) || 0;

        return {
            id: Number(data.inschrijvingId),

            nummer: "#" + data.inschrijvingId,

            deelnemers,

            naam: deelnemers.length
                ? deelnemers
                    .map(d => d.naam || "Naam onbekend")
                    .join(", ")
                : "Niet beschikbaar",

            school: scholen.join(", ") || "—",

            aantal:
                Number(data.aantalDeelnemers) || 0,

            afstand:
                [5, 10].includes(afstandKm)
                    ? afstandKm + " km"
                    : "—",

            status: data.status || "Onbekend",

            datum: data.inschrijfdatum || "",

            email:
                data.contactpersoon?.email || "—",

            telefoon:
                data.contactpersoon?.telefoonnummer || "—",

            evenementId:
                data.evenementId ?? "—"
        };
    }


    function formatDate(datum) {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
            return "Onbekend";
        }

        return new Date(
            datum + "T12:00:00"
        ).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    // ======================================
    // 3. PAGINATEKSTEN AANPASSEN
    // ======================================

    function pasTekstenAan() {

        const tag = document.querySelector(
            ".bm-demo-tag"
        );

        if (tag) {
            tag.textContent = "Database";
        }

        const account = document.querySelector(
            ".bm-account small"
        );

        if (account) {
            account.textContent = "Beheeromgeving";
        }

        const notice = document.querySelector(
            ".bm-content .bm-notice"
        );

        if (notice) {

            const title = notice.querySelector(
                "strong"
            );

            const description = notice.querySelector(
                "p"
            );

            if (title) {
                title.textContent =
                    "Verbonden met PostgreSQL";
            }

            if (description) {

                description.textContent =
                    "Deze pagina toont echte inschrijvingen " +
                    "met deelnemers, school/groep, afstand " +
                    "en status. Oudere testinschrijvingen " +
                    "kunnen nog ontbrekende gegevens hebben. " +
                    "Betalingen zijn nog niet gekoppeld.";
            }
        }

        // Bestaande tabel behouden.
        const headers = document.querySelectorAll(
            ".bi-table thead th"
        );

        if (headers.length >= 9) {

            headers[2].textContent = "Deelnemer(s)";
            headers[3].textContent = "School / groep";
            headers[4].textContent = "Aantal";
            headers[5].textContent = "Afstand";
        }

        // Detailvenster aanpassen.
        const detailLabels = document.querySelectorAll(
            ".bi-details dt"
        );

        if (detailLabels.length >= 7) {

            detailLabels[1].textContent = "Deelnemer(s)";
            detailLabels[2].textContent = "School / groep";
            detailLabels[3].textContent = "Aantal deelnemers";
            detailLabels[4].textContent = "Afstand";
        }

        // Afstandsfilter activeren.
        distanceFilter.disabled = false;

        distanceFilter.options[0].textContent =
            "Alle afstanden";

        const distanceLabel = document.querySelector(
            'label[for="biDistance"]'
        );

        if (distanceLabel) {
            distanceLabel.textContent = "Afstand";
        }

        const stats = document.querySelectorAll(
            ".bi-stat small"
        );

        if (stats[0]) {
            stats[0].textContent = "In de database";
        }

        if (stats[1]) {
            stats[1].textContent =
                "Status Betaald (geen betaalcontrole)";
        }

        if (stats[2]) {
            stats[2].textContent = "Open of Ingediend";
        }

        const footer = document.querySelector(
            ".bm-content-footer"
        );

        if (footer) {
            footer.textContent =
                "Avond4daagse 2027 · " +
                "Inschrijvingen · Database";
        }
    }


    // ======================================
    // 4. STATUSFILTER BIJWERKEN
    // ======================================

    function updateStatusOptions() {

        const existing = new Set(
            [...statusFilter.options].map(
                option => option.value
            )
        );

        for (const item of inschrijvingen) {

            if (existing.has(item.status)) {
                continue;
            }

            const option = document.createElement(
                "option"
            );

            option.value = item.status;
            option.textContent = item.status;

            statusFilter.appendChild(option);

            existing.add(item.status);
        }
    }


    // ======================================
    // 5. ZOEKEN EN FILTEREN
    // ======================================

    function getFilteredRows() {

        const query = searchInput.value
            .trim()
            .toLocaleLowerCase("nl-NL");

        const distance = distanceFilter.value;
        const status = statusFilter.value;

        return inschrijvingen.filter(item => {

            const searchable = [
                item.nummer,
                item.naam,
                item.school,
                item.email,
                item.telefoon,
                item.aantal,
                item.status,
                item.evenementId
            ]
                .join(" ")
                .toLocaleLowerCase("nl-NL");

            return (
                (!query || searchable.includes(query)) &&
                (
                    distance === "all" ||
                    item.afstand === distance
                ) &&
                (
                    status === "all" ||
                    item.status === status
                )
            );
        });
    }


    // ======================================
    // 6. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        $("biTotal").textContent =
            inschrijvingen.length;

        $("biPaid").textContent =
            inschrijvingen.filter(
                item => item.status === "Betaald"
            ).length;

        $("biOpen").textContent =
            inschrijvingen.filter(
                item => [
                    "Open",
                    "Ingediend"
                ].includes(item.status)
            ).length;

        $("biCancelled").textContent =
            inschrijvingen.filter(
                item => item.status === "Geannuleerd"
            ).length;
    }


    function statusClass(status) {

        if (status === "Betaald") {
            return "bi-badge--paid";
        }

        if (status === "Geannuleerd") {
            return "bi-badge--cancelled";
        }

        return "bi-badge--open";
    }


    // ======================================
    // 7. TABELCELLEN MAKEN
    // ======================================

    function createCell(value, className = "") {

        const cell = document.createElement("td");

        cell.textContent = String(value);

        if (className) {
            cell.className = className;
        }

        return cell;
    }


    // ======================================
    // 8. INSCHRIJVINGSRIJ MAKEN
    // ======================================

    function createRow(item) {

        const row = document.createElement("tr");

        const checkCell = document.createElement("td");

        const checkbox = document.createElement(
            "input"
        );

        checkbox.type = "checkbox";
        checkbox.className = "bi-row-select";
        checkbox.dataset.id = String(item.id);

        checkbox.checked = selected.has(item.id);

        checkbox.disabled =
            item.status === "Geannuleerd";

        checkbox.setAttribute(
            "aria-label",
            "Selecteer inschrijving " + item.nummer
        );

        checkCell.appendChild(checkbox);

        row.appendChild(checkCell);

        // Echte inschrijvingsgegevens.
        row.appendChild(
            createCell(item.nummer, "bi-number")
        );

        row.appendChild(
            createCell(item.naam, "bi-name")
        );

        row.appendChild(
            createCell(item.school)
        );

        row.appendChild(
            createCell(item.aantal)
        );

        row.appendChild(
            createCell(item.afstand)
        );

        // Status.
        const statusCell = document.createElement(
            "td"
        );

        const badge = document.createElement(
            "span"
        );

        badge.className =
            "bi-badge " + statusClass(item.status);

        badge.textContent = item.status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        // Datum.
        row.appendChild(
            createCell(formatDate(item.datum))
        );

        // Detailknop.
        const actionCell = document.createElement(
            "td"
        );

        const button = document.createElement(
            "button"
        );

        button.type = "button";
        button.className = "bi-detail-button";
        button.dataset.id = String(item.id);
        button.textContent = "Bekijk";

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        return row;
    }


    // ======================================
    // 9. SELECTIE BIJWERKEN
    // ======================================

    function updateSelectionUI() {

        selectionText.textContent =
            selected.size + " geselecteerd";

        cancelButton.disabled =
            selected.size === 0;

        const selectable = currentPageRows.filter(
            item => item.status !== "Geannuleerd"
        );

        const chosen = selectable.filter(
            item => selected.has(item.id)
        );

        selectAll.disabled =
            selectable.length === 0;

        selectAll.checked =
            selectable.length > 0 &&
            chosen.length === selectable.length;

        selectAll.indeterminate =
            chosen.length > 0 &&
            chosen.length < selectable.length;
    }


    // ======================================
    // 10. TABEL WEERGEVEN
    // ======================================

    function renderTable() {

        const filtered = getFilteredRows();

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / rowsPerPage)
        );

        currentPage = Math.min(
            currentPage,
            totalPages
        );

        const start =
            (currentPage - 1) * rowsPerPage;

        currentPageRows = filtered.slice(
            start,
            start + rowsPerPage
        );

        tableBody.replaceChildren();

        if (filtered.length === 0) {

            const row = document.createElement(
                "tr"
            );

            const cell = createCell(
                "Geen inschrijvingen gevonden in de database.",
                "bi-no-results"
            );

            cell.colSpan = 9;

            row.appendChild(cell);
            tableBody.appendChild(row);

        } else {

            currentPageRows.forEach(item => {

                tableBody.appendChild(
                    createRow(item)
                );
            });
        }

        const first = filtered.length
            ? start + 1
            : 0;

        const last = Math.min(
            start + rowsPerPage,
            filtered.length
        );

        paginationText.textContent =
            first + "–" + last +
            " van " + filtered.length +
            " inschrijvingen";

        currentPageLabel.textContent =
            currentPage + " / " + totalPages;

        prevButton.disabled =
            currentPage <= 1;

        nextButton.disabled =
            currentPage >= totalPages;

        exportButton.disabled =
            filtered.length === 0;

        updateStatistics();
        updateSelectionUI();
    }


    // ======================================
    // 11. FILTERS
    // ======================================

    function resetView() {

        currentPage = 1;
        selected.clear();

        renderTable();
    }

    searchInput.addEventListener(
        "input",
        resetView
    );

    distanceFilter.addEventListener(
        "change",
        resetView
    );

    statusFilter.addEventListener(
        "change",
        resetView
    );

    filterForm.addEventListener(
        "submit",
        event => event.preventDefault()
    );

    filterForm.addEventListener(
        "reset",
        () => setTimeout(resetView, 0)
    );


    // ======================================
    // 12. PAGINERING
    // ======================================

    prevButton.addEventListener("click", () => {

        if (currentPage <= 1) {
            return;
        }

        currentPage--;

        selected.clear();
        renderTable();
    });

    nextButton.addEventListener("click", () => {

        const totalPages = Math.max(
            1,
            Math.ceil(
                getFilteredRows().length / rowsPerPage
            )
        );

        if (currentPage >= totalPages) {
            return;
        }

        currentPage++;

        selected.clear();
        renderTable();
    });


    // ======================================
    // 13. RIJEN SELECTEREN
    // ======================================

    tableBody.addEventListener("change", event => {

        const checkbox = event.target.closest(
            ".bi-row-select"
        );

        if (!checkbox) {
            return;
        }

        const id = Number(
            checkbox.dataset.id
        );

        if (checkbox.checked) {
            selected.add(id);
        } else {
            selected.delete(id);
        }

        updateSelectionUI();
    });


    selectAll.addEventListener("change", () => {

        const shouldSelect = selectAll.checked;

        currentPageRows.forEach(item => {

            if (item.status === "Geannuleerd") {
                return;
            }

            if (shouldSelect) {
                selected.add(item.id);
            } else {
                selected.delete(item.id);
            }
        });

        renderTable();
    });


    // ======================================
    // 14. INSCHRIJVING ANNULEREN
    // ======================================

    cancelButton.addEventListener(
        "click",
        async () => {

            if (selected.size === 0) {
                return;
            }

            const amount = selected.size;

            const confirmed = window.confirm(
                "Wil je " + amount +
                " inschrijving(en) echt annuleren?\n\n" +
                "De wijziging wordt opgeslagen in PostgreSQL."
            );

            if (!confirmed) {
                return;
            }

            cancelButton.disabled = true;

            let verwerkt = 0;

            try {

                for (const id of selected) {

                    const item = inschrijvingen.find(
                        record => record.id === id
                    );

                    if (
                        !item ||
                        item.status === "Geannuleerd"
                    ) {
                        continue;
                    }

                    const updated = await apiRequest(
                        "/" + id,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                aantalDeelnemers: item.aantal,
                                status: "Geannuleerd"
                            })
                        }
                    );

                    const index =
                        inschrijvingen.findIndex(
                            record => record.id === id
                        );

                    if (index !== -1) {

                        inschrijvingen[index] =
                            normaliseer(updated);
                    }

                    verwerkt++;
                }

                feedback.textContent =
                    verwerkt +
                    " inschrijving(en) geannuleerd in de database.";

            } catch (error) {

                feedback.textContent =
                    verwerkt +
                    " verwerkt. Daarna fout: " +
                    error.message;

            } finally {

                selected.clear();
                renderTable();
            }
        }
    );


    // ======================================
    // 15. DETAILVENSTER
    // ======================================

    function showDetails(id) {

        const item = inschrijvingen.find(
            record => record.id === id
        );

        if (!item) {
            return;
        }

        $("biDetailNumber").textContent =
            item.nummer;

        $("biDetailName").textContent =
            item.naam;

        $("biDetailSchool").textContent =
            item.school;

        $("biDetailGroup").textContent =
            item.aantal;

        $("biDetailDistance").textContent =
            item.afstand;

        $("biDetailStatus").textContent =
            item.status;

        $("biDetailDate").textContent =
            formatDate(item.datum);

        detailDialog.showModal();
    }


    tableBody.addEventListener(
        "click",
        event => {

            const button = event.target.closest(
                ".bi-detail-button"
            );

            if (!button) {
                return;
            }

            showDetails(
                Number(button.dataset.id)
            );
        }
    );


    $("biCloseDialog").addEventListener(
        "click",
        () => detailDialog.close()
    );

    $("biCloseDialogBottom").addEventListener(
        "click",
        () => detailDialog.close()
    );


    // ======================================
    // 16. CSV EXPORT
    // ======================================

    function csvCell(value) {

        let text = String(value ?? "");

        if (/^\s*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' +
            text.replace(/"/g, '""') +
            '"';
    }


    exportButton.addEventListener("click", () => {

        const rows = getFilteredRows();

        if (rows.length === 0) {
            return;
        }

        const columns = [
            "Inschrijfnummer",
            "Deelnemers",
            "School / groep",
            "Aantal",
            "Afstand",
            "Status",
            "Datum",
            "Contact-e-mail",
            "Telefoon",
            "Evenement-ID"
        ];

        const dataRows = rows.map(item => [
            item.nummer,
            item.naam,
            item.school,
            item.aantal,
            item.afstand,
            item.status,
            item.datum,
            item.email,
            item.telefoon,
            item.evenementId
        ]);

        const csv = [
            columns.map(csvCell).join(";"),
            ...dataRows.map(
                row => row.map(csvCell).join(";")
            )
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            "avond4daagse-inschrijvingen.csv";

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        feedback.textContent =
            rows.length +
            " inschrijving(en) geëxporteerd.";
    });


    // ======================================
    // 17. INSCHRIJVINGEN OPHALEN
    // ======================================

    async function laadInschrijvingen() {

        try {

            feedback.textContent =
                "Inschrijvingen ophalen uit PostgreSQL...";

            const data = await apiRequest();

            if (!Array.isArray(data)) {

                throw new Error(
                    "Ongeldige API-response."
                );
            }

            inschrijvingen = data.map(
                normaliseer
            );

            updateStatusOptions();

            renderTable();

            feedback.textContent =
                inschrijvingen.length
                    ? inschrijvingen.length +
                      " inschrijving(en) geladen uit PostgreSQL."
                    : "Er staan nog geen inschrijvingen in de database.";

        } catch (error) {

            console.error(error);

            inschrijvingen = [];

            renderTable();

            feedback.textContent = error.message;
        }
    }


    // ======================================
    // 18. START
    // ======================================

    pasTekstenAan();
    laadInschrijvingen();

});
