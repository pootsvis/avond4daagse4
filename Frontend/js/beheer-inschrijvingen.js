
document.addEventListener("DOMContentLoaded", () => {
    // AVOND4DAAGSE 2027 - ECHTE INSCHRIJVINGEN

    const API_URL = "http://localhost:5278/api/Inschrijving";
    const $ = id => document.getElementById(id);

    let inschrijvingen = [];
    let currentPage = 1;
    let currentPageRows = [];
    const rowsPerPage = 5;
    const selected = new Set();

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

    // ======================================
    // 1. VERBINDING MET DE BACKEND
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
                "Alleen accounts met de rol Voorzitter " +
                "kunnen inschrijvingen beheren."
            );
        }

        if (!response.ok) {
            throw new Error(
                "API-verzoek mislukt: HTTP " + response.status
            );
        }

        if (response.status === 204) return null;
        return response.json();
    }

    // ======================================
    // 2. API-GEGEVENS OMZETTEN
    // ======================================

    function normaliseer(data) {
        return {
            id: Number(data.inschrijvingId),
            nummer: "#" + data.inschrijvingId,
            email: data.contactpersoon?.email || "—",
            telefoon: data.contactpersoon?.telefoonnummer || "—",
            aantal: data.aantalDeelnemers ?? 0,
            evenement: data.evenementId ?? "—",
            status: data.status || "Onbekend",
            datum: data.inschrijfdatum || ""
        };
    }

    function formatDate(datum) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
            return "Onbekend";
        }

        return new Date(datum + "T12:00:00")
            .toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    // ======================================
    // 3. BESTAANDE PAGINA AANPASSEN
    // ======================================

    function pasTekstenAan() {
        const tag = document.querySelector(".bm-demo-tag");
        if (tag) tag.textContent = "Database";

        const account = document.querySelector(".bm-account small");
        if (account) account.textContent = "Beheeromgeving";

        const notice = document.querySelector(".bm-content .bm-notice");

        if (notice) {
            const title = notice.querySelector("strong");
            const description = notice.querySelector("p");

            if (title) {
                title.textContent = "Verbonden met de database";
            }

            if (description) {
                description.textContent =
                    "Inschrijvingen worden opgehaald uit PostgreSQL. " +
                    "De API bevat momenteel contactgegevens, " +
                    "aantal deelnemers, evenement-ID, status en datum. " +
                    "Deelnemernamen, scholen, groepen en afstanden " +
                    "moeten nog via de backend worden gekoppeld.";
            }
        }

        // De bestaande tabelindeling behouden,
        // maar de kolommen eerlijk benoemen.
        const headers = document.querySelectorAll(
            ".bi-table thead th"
        );

        if (headers.length >= 9) {
            headers[2].textContent = "Contact-e-mail";
            headers[3].textContent = "Aantal deelnemers";
            headers[4].textContent = "Evenement-ID";
            headers[5].textContent = "Telefoon";
        }

        // Afstand bestaat nog niet in de API.
        distanceFilter.value = "all";
        distanceFilter.disabled = true;
        distanceFilter.options[0].textContent =
            "Nog niet beschikbaar";

        const distanceLabel = document.querySelector(
            'label[for="biDistance"]'
        );

        if (distanceLabel) {
            distanceLabel.textContent = "Afstand (nog niet beschikbaar)";
        }

        // Ook de detailvelden krijgen correcte namen.
        const detailLabels = document.querySelectorAll(
            ".bi-details dt"
        );

        if (detailLabels.length >= 7) {
            detailLabels[1].textContent = "Contact-e-mail";
            detailLabels[2].textContent = "Aantal deelnemers";
            detailLabels[3].textContent = "Evenement-ID";
            detailLabels[4].textContent = "Telefoonnummer";
        }

        const stats = document.querySelectorAll(".bi-stat small");

        if (stats[0]) stats[0].textContent = "In de database";

        if (stats[1]) {
            stats[1].textContent = "Status Betaald";
        }

        if (stats[2]) {
            stats[2].textContent = "Status Open of Ingediend";
        }

        const footer = document.querySelector(".bm-content-footer");

        if (footer) {
            footer.textContent =
                "Avond4daagse 2027 · Inschrijvingen · Database";
        }
    }

    function updateStatusOptions() {
        const bestaande = new Set(
            Array.from(statusFilter.options).map(o => o.value)
        );

        for (const item of inschrijvingen) {
            if (!bestaande.has(item.status)) {
                const option = document.createElement("option");
                option.value = item.status;
                option.textContent = item.status;
                statusFilter.appendChild(option);
                bestaande.add(item.status);
            }
        }
    }

    // ======================================
    // 4. STATISTIEKEN
    // ======================================

    function updateStatistics() {
        $("biTotal").textContent = inschrijvingen.length;

        $("biPaid").textContent = inschrijvingen.filter(
            item => item.status === "Betaald"
        ).length;

        $("biOpen").textContent = inschrijvingen.filter(
            item => ["Open", "Ingediend"].includes(item.status)
        ).length;

        $("biCancelled").textContent = inschrijvingen.filter(
            item => item.status === "Geannuleerd"
        ).length;
    }

    // ======================================
    // 5. ZOEKEN EN FILTEREN
    // ======================================

    function getFilteredRows() {
        const query = searchInput.value
            .trim()
            .toLocaleLowerCase("nl-NL");

        const status = statusFilter.value;

        return inschrijvingen.filter(item => {
            const searchable = [
                item.nummer,
                item.id,
                item.email,
                item.telefoon,
                item.aantal,
                item.evenement,
                item.status
            ].join(" ").toLocaleLowerCase("nl-NL");

            return (
                (!query || searchable.includes(query)) &&
                (status === "all" || item.status === status)
            );
        });
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
    // 6. TABELRIJEN MAKEN
    // ======================================

    function createCell(value, className = "") {
        const td = document.createElement("td");
        td.textContent = String(value);

        if (className) {
            td.className = className;
        }

        return td;
    }

    function createRow(item) {
        const tr = document.createElement("tr");

        const selectCell = document.createElement("td");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "bi-row-select";
        checkbox.dataset.id = String(item.id);
        checkbox.checked = selected.has(item.id);
        checkbox.disabled = item.status === "Geannuleerd";

        checkbox.setAttribute(
            "aria-label",
            "Selecteer inschrijving " + item.nummer
        );

        selectCell.appendChild(checkbox);
        tr.appendChild(selectCell);

        tr.appendChild(createCell(item.nummer, "bi-number"));
        tr.appendChild(createCell(item.email, "bi-name"));
        tr.appendChild(createCell(item.aantal));
        tr.appendChild(createCell(item.evenement));
        tr.appendChild(createCell(item.telefoon));

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            "bi-badge " + statusClass(item.status);

        badge.textContent = item.status;
        statusCell.appendChild(badge);
        tr.appendChild(statusCell);

        tr.appendChild(createCell(formatDate(item.datum)));

        const actionCell = document.createElement("td");
        const detailButton = document.createElement("button");

        detailButton.type = "button";
        detailButton.className = "bi-detail-button";
        detailButton.dataset.id = String(item.id);
        detailButton.textContent = "Bekijk";

        actionCell.appendChild(detailButton);
        tr.appendChild(actionCell);

        return tr;
    }

    // ======================================
    // 7. SELECTIE
    // ======================================

    function updateSelectionUI() {
        selectionText.textContent =
            selected.size + " geselecteerd";

        cancelButton.disabled = selected.size === 0;

        const selectable = currentPageRows.filter(
            item => item.status !== "Geannuleerd"
        );

        const selectedOnPage = selectable.filter(
            item => selected.has(item.id)
        );

        selectAll.disabled = selectable.length === 0;

        selectAll.checked =
            selectable.length > 0 &&
            selectedOnPage.length === selectable.length;

        selectAll.indeterminate =
            selectedOnPage.length > 0 &&
            selectedOnPage.length < selectable.length;
    }

    // ======================================
    // 8. TABEL TONEN
    // ======================================

    function renderTable() {
        const filtered = getFilteredRows();

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / rowsPerPage)
        );

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * rowsPerPage;

        currentPageRows = filtered.slice(
            start,
            start + rowsPerPage
        );

        tableBody.replaceChildren();

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 9;
            cell.className = "bi-no-results";
            cell.textContent =
                "Geen inschrijvingen gevonden in de database.";

            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            currentPageRows.forEach(item => {
                tableBody.appendChild(createRow(item));
            });
        }

        const first = filtered.length === 0
            ? 0
            : start + 1;

        const last = Math.min(
            start + rowsPerPage,
            filtered.length
        );

        paginationText.textContent =
            first + "–" + last +
            " van " + filtered.length + " inschrijvingen";

        currentPageLabel.textContent =
            currentPage + " / " + totalPages;

        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        exportButton.disabled = filtered.length === 0;

        updateStatistics();
        updateSelectionUI();
    }

    // ======================================
    // 9. PAGINERING EN FILTERS
    // ======================================

    function resetView() {
        currentPage = 1;
        selected.clear();
        renderTable();
    }

    searchInput.addEventListener("input", resetView);
    statusFilter.addEventListener("change", resetView);

    filterForm.addEventListener("submit", event => {
        event.preventDefault();
    });

    filterForm.addEventListener("reset", () => {
        setTimeout(resetView, 0);
    });

    prevButton.addEventListener("click", () => {
        if (currentPage <= 1) return;

        currentPage--;
        selected.clear();
        renderTable();
    });

    nextButton.addEventListener("click", () => {
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredRows().length / rowsPerPage)
        );

        if (currentPage >= totalPages) return;

        currentPage++;
        selected.clear();
        renderTable();
    });

    tableBody.addEventListener("change", event => {
        const checkbox = event.target.closest(".bi-row-select");

        if (!checkbox) return;

        const id = Number(checkbox.dataset.id);

        if (checkbox.checked) {
            selected.add(id);
        } else {
            selected.delete(id);
        }

        updateSelectionUI();
    });

    selectAll.addEventListener("change", () => {
        const shouldSelect = selectAll.checked;

        for (const item of currentPageRows) {
            if (item.status === "Geannuleerd") continue;

            if (shouldSelect) {
                selected.add(item.id);
            } else {
                selected.delete(item.id);
            }
        }

        renderTable();
    });

    // ======================================
    // 10. INSCHRIJVING ANNULEREN
    // ======================================

    cancelButton.addEventListener("click", async () => {
        if (selected.size === 0) return;

        const amount = selected.size;

        const confirmed = window.confirm(
            "Wil je " + amount +
            " inschrijving(en) echt annuleren?\n\n" +
            "De status wordt gewijzigd in PostgreSQL."
        );

        if (!confirmed) return;

        cancelButton.disabled = true;
        let verwerkt = 0;

        try {
            for (const id of selected) {
                const item = inschrijvingen.find(
                    record => record.id === id
                );

                if (!item || item.status === "Geannuleerd") {
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

                const index = inschrijvingen.findIndex(
                    record => record.id === id
                );

                if (index !== -1) {
                    inschrijvingen[index] = normaliseer(updated);
                }

                verwerkt++;
            }

            feedback.textContent =
                verwerkt + " inschrijving(en) geannuleerd " +
                "in de database.";

        } catch (error) {
            feedback.textContent =
                verwerkt + " verwerkt. Daarna fout: " +
                error.message;
        } finally {
            selected.clear();
            renderTable();
        }
    });

    // ======================================
    // 11. DETAILS
    // ======================================

    function showDetails(id) {
        const item = inschrijvingen.find(
            record => record.id === id
        );

        if (!item) return;

        $("biDetailNumber").textContent = item.nummer;
        $("biDetailName").textContent = item.email;
        $("biDetailSchool").textContent = item.aantal;
        $("biDetailGroup").textContent = item.evenement;
        $("biDetailDistance").textContent = item.telefoon;
        $("biDetailStatus").textContent = item.status;
        $("biDetailDate").textContent = formatDate(item.datum);

        detailDialog.showModal();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest(".bi-detail-button");

        if (!button) return;

        showDetails(Number(button.dataset.id));
    });

    $("biCloseDialog").addEventListener("click", () => {
        detailDialog.close();
    });

    $("biCloseDialogBottom").addEventListener("click", () => {
        detailDialog.close();
    });

    // ======================================
    // 12. CSV EXPORT
    // ======================================

    function csvCell(value) {
        let text = String(value ?? "");

        if (/^\s*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    exportButton.addEventListener("click", () => {
        const rows = getFilteredRows();

        if (!rows.length) return;

        const columns = [
            "Inschrijfnummer",
            "Contact-e-mail",
            "Aantal deelnemers",
            "Evenement-ID",
            "Telefoon",
            "Status",
            "Inschrijfdatum"
        ];

        const dataRows = rows.map(item => [
            item.nummer,
            item.email,
            item.aantal,
            item.evenement,
            item.telefoon,
            item.status,
            item.datum
        ]);

        const csv = [
            columns.map(csvCell).join(";"),
            ...dataRows.map(
                row => row.map(csvCell).join(";")
            )
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "avond4daagse-inschrijvingen.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        feedback.textContent =
            rows.length + " inschrijving(en) geëxporteerd.";
    });

    // ======================================
    // 13. GEGEVENS LADEN
    // ======================================

    async function laadInschrijvingen() {
        try {
            feedback.textContent =
                "Inschrijvingen ophalen uit de database...";

            const data = await apiRequest();

            if (!Array.isArray(data)) {
                throw new Error(
                    "Ongeldige gegevens ontvangen van de API."
                );
            }

            inschrijvingen = data.map(normaliseer);

            updateStatusOptions();
            renderTable();

            feedback.textContent = inschrijvingen.length
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

    pasTekstenAan();
    laadInschrijvingen();
});
