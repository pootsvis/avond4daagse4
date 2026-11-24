
// ==========================================
// AVOND4DAAGSE 2027
// INSCHRIJVINGENBEHEER - FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. VOORBEELDGEGEVENS
    // ======================================
    // Deze gegevens komen uit de bestaande
    // inschrijvingenpagina van het project.
    //
    // Er is nog GEEN databaseverbinding.
    // Wijzigingen gelden alleen zolang deze
    // pagina geopend is.
    // ======================================

    const inschrijvingen = [
        {
            nummer: "A4D-1247",
            naam: "Milan Jansen",
            school: "De Regenboog",
            groep: "5",
            afstand: "10 km",
            status: "Open",
            datum: "14 apr"
        },
        {
            nummer: "A4D-1246",
            naam: "Sara Bakker",
            school: "De Horizon",
            groep: "3",
            afstand: "5 km",
            status: "Betaald",
            datum: "14 apr"
        },
        {
            nummer: "A4D-1245",
            naam: "Finn Smit",
            school: "Particulier",
            groep: "7",
            afstand: "10 km",
            status: "Betaald",
            datum: "13 apr"
        },
        {
            nummer: "A4D-1244",
            naam: "Nora Visser",
            school: "De Klimboom",
            groep: "4",
            afstand: "5 km",
            status: "Geannuleerd",
            datum: "13 apr"
        },
        {
            nummer: "A4D-1243",
            naam: "Sem de Boer",
            school: "De Regenboog",
            groep: "6",
            afstand: "5 km",
            status: "Betaald",
            datum: "13 apr"
        },
        {
            nummer: "A4D-1242",
            naam: "Yara Meijer",
            school: "De Horizon",
            groep: "8",
            afstand: "10 km",
            status: "Open",
            datum: "12 apr"
        },
        {
            nummer: "A4D-1241",
            naam: "Mees Vos",
            school: "De Klimboom",
            groep: "5",
            afstand: "5 km",
            status: "Betaald",
            datum: "12 apr"
        }
    ];


    // ======================================
    // 2. ELEMENTEN
    // ======================================

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
    const closeDialog = $("biCloseDialog");
    const closeDialogBottom = $("biCloseDialogBottom");


    // ======================================
    // 3. PAGINERING EN SELECTIE
    // ======================================

    const rowsPerPage = 5;

    let currentPage = 1;

    // Alleen huidige selectie in dit scherm.
    const selected = new Set();

    let currentPageRows = [];


    // ======================================
    // 4. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        $("biTotal").textContent =
            String(inschrijvingen.length);

        $("biPaid").textContent =
            String(
                inschrijvingen.filter(
                    item => item.status === "Betaald"
                ).length
            );

        $("biOpen").textContent =
            String(
                inschrijvingen.filter(
                    item => item.status === "Open"
                ).length
            );

        $("biCancelled").textContent =
            String(
                inschrijvingen.filter(
                    item => item.status === "Geannuleerd"
                ).length
            );
    }


    // ======================================
    // 5. FILTEREN
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
                item.groep
            ].join(" ").toLocaleLowerCase("nl-NL");

            const matchesSearch =
                query === "" || searchable.includes(query);

            const matchesDistance =
                distance === "all" ||
                item.afstand === distance;

            const matchesStatus =
                status === "all" ||
                item.status === status;

            return (
                matchesSearch &&
                matchesDistance &&
                matchesStatus
            );
        });
    }


    // ======================================
    // 6. STATUSKLEUREN
    // ======================================

    function statusClass(status) {

        if (status === "Betaald") {
            return "bi-badge--paid";
        }

        if (status === "Open") {
            return "bi-badge--open";
        }

        return "bi-badge--cancelled";
    }


    // ======================================
    // 7. TABELCELLEN MAKEN
    // ======================================

    function createCell(text, className = "") {

        const td = document.createElement("td");

        td.textContent = String(text);

        if (className) {
            td.className = className;
        }

        return td;
    }


    function createRow(item) {

        const tr = document.createElement("tr");

        // Selectievakje
        const selectCell = document.createElement("td");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "bi-row-select";
        checkbox.dataset.id = item.nummer;

        checkbox.setAttribute(
            "aria-label",
            "Selecteer inschrijving " + item.nummer
        );

        checkbox.checked = selected.has(item.nummer);

        // Geannuleerde inschrijvingen kunnen
        // niet opnieuw geannuleerd worden.
        checkbox.disabled =
            item.status === "Geannuleerd";

        selectCell.appendChild(checkbox);
        tr.appendChild(selectCell);


        // Normale kolommen
        tr.appendChild(
            createCell(item.nummer, "bi-number")
        );

        tr.appendChild(
            createCell(item.naam, "bi-name")
        );

        tr.appendChild(
            createCell(item.school)
        );

        tr.appendChild(
            createCell(item.groep)
        );

        tr.appendChild(
            createCell(item.afstand)
        );


        // Status
        const statusCell = document.createElement("td");

        const badge = document.createElement("span");

        badge.className =
            "bi-badge " + statusClass(item.status);

        badge.textContent = item.status;

        statusCell.appendChild(badge);
        tr.appendChild(statusCell);


        // Datum
        tr.appendChild(
            createCell(item.datum)
        );


        // Detailknop
        const actionCell = document.createElement("td");

        const detailButton = document.createElement("button");

        detailButton.type = "button";
        detailButton.className = "bi-detail-button";
        detailButton.dataset.id = item.nummer;

        detailButton.textContent = "Bekijk";

        detailButton.setAttribute(
            "aria-label",
            "Bekijk details van " + item.naam
        );

        actionCell.appendChild(detailButton);
        tr.appendChild(actionCell);

        return tr;
    }


    // ======================================
    // 8. SELECTIE BIJWERKEN
    // ======================================

    function updateSelectionUI() {

        selectionText.textContent =
            selected.size + " geselecteerd";

        cancelButton.disabled = selected.size === 0;

        const selectable = currentPageRows.filter(
            item => item.status !== "Geannuleerd"
        );

        const selectedOnPage = selectable.filter(
            item => selected.has(item.nummer)
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
    // 9. TABEL TONEN
    // ======================================

    function renderTable() {

        const filtered = getFilteredRows();

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / rowsPerPage)
        );

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const start = (currentPage - 1) * rowsPerPage;

        currentPageRows = filtered.slice(
            start,
            start + rowsPerPage
        );

        tableBody.replaceChildren();


        // Geen resultaten
        if (filtered.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 9;
            cell.className = "bi-no-results";

            cell.textContent =
                "Geen inschrijvingen gevonden. " +
                "Pas je zoekopdracht of filters aan.";

            row.appendChild(cell);
            tableBody.appendChild(row);

        } else {

            currentPageRows.forEach(item => {
                tableBody.appendChild(
                    createRow(item)
                );
            });

        }


        // Paginering
        const first = filtered.length === 0
            ? 0
            : start + 1;

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

        prevButton.disabled = currentPage <= 1;

        nextButton.disabled =
            currentPage >= totalPages;

        exportButton.disabled =
            filtered.length === 0;


        updateStatistics();
        updateSelectionUI();
    }


    // ======================================
    // 10. FILTEREVENTS
    // ======================================

    function resetView() {

        currentPage = 1;

        selected.clear();

        feedback.textContent = "";

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

    filterForm.addEventListener("submit", event => {
        event.preventDefault();
    });

    filterForm.addEventListener("reset", () => {

        // Wachten tot browser de waarden heeft gereset.
        setTimeout(resetView, 0);
    });


    // ======================================
    // 11. PAGINERING
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
    // 12. EEN RIJ SELECTEREN
    // ======================================

    tableBody.addEventListener("change", event => {

        const checkbox = event.target.closest(
            ".bi-row-select"
        );

        if (!checkbox) {
            return;
        }

        const id = checkbox.dataset.id;

        if (checkbox.checked) {
            selected.add(id);
        } else {
            selected.delete(id);
        }

        updateSelectionUI();
    });


    // ======================================
    // 13. ALLES OP HUIDIGE PAGINA SELECTEREN
    // ======================================

    selectAll.addEventListener("change", () => {

        const shouldSelect = selectAll.checked;

        currentPageRows.forEach(item => {

            if (item.status === "Geannuleerd") {
                return;
            }

            if (shouldSelect) {
                selected.add(item.nummer);
            } else {
                selected.delete(item.nummer);
            }
        });

        renderTable();
    });


    // ======================================
    // 14. INSCHRIJVING ANNULEREN (DEMO)
    // ======================================

    cancelButton.addEventListener("click", () => {

        if (selected.size === 0) {
            return;
        }

        const amount = selected.size;

        const confirmed = window.confirm(
            "Wil je " + amount +
            " geselecteerde inschrijving(en) " +
            "annuleren in deze DEMO?\n\n" +
            "Er wordt niets gewijzigd in de database."
        );

        if (!confirmed) {
            return;
        }

        inschrijvingen.forEach(item => {

            if (selected.has(item.nummer)) {
                item.status = "Geannuleerd";
            }

        });

        selected.clear();

        renderTable();

        feedback.textContent =
            amount + " inschrijving(en) geannuleerd " +
            "in de frontenddemo. Herlaad de pagina " +
            "om de oorspronkelijke voorbeelden terug te zien.";
    });


    // ======================================
    // 15. DETAILVENSTER
    // ======================================

    function showDetails(id) {

        const item = inschrijvingen.find(
            record => record.nummer === id
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
            item.groep;

        $("biDetailDistance").textContent =
            item.afstand;

        $("biDetailStatus").textContent =
            item.status;

        $("biDetailDate").textContent =
            item.datum;

        detailDialog.showModal();
    }


    tableBody.addEventListener("click", event => {

        const button = event.target.closest(
            ".bi-detail-button"
        );

        if (!button) {
            return;
        }

        showDetails(button.dataset.id);
    });


    closeDialog.addEventListener("click", () => {
        detailDialog.close();
    });

    closeDialogBottom.addEventListener("click", () => {
        detailDialog.close();
    });


    // ======================================
    // 16. CSV EXPORT
    // ======================================

    function csvCell(value) {

        let text = String(value ?? "");

        // Voorkom dat spreadsheetsoftware
        // gebruikersinhoud als formule uitvoert.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }


    exportButton.addEventListener("click", () => {

        const rows = getFilteredRows();

        if (rows.length === 0) {
            return;
        }

        const columns = [
            "Inschrijfnummer",
            "Deelnemer",
            "School",
            "Groep",
            "Afstand",
            "Status",
            "Datum"
        ];

        const dataRows = rows.map(item => [
            item.nummer,
            item.naam,
            item.school,
            item.groep,
            item.afstand,
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
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download =
            "avond4daagse-inschrijvingen-demo.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        feedback.textContent =
            rows.length +
            " gefilterde voorbeeldinschrijving(en) " +
            "geëxporteerd naar CSV.";
    });


    // ======================================
    // 17. START
    // ======================================

    renderTable();

});
