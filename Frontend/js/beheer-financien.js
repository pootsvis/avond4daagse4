
// ==========================================
// AVOND4DAAGSE 2027
// FINANCIËN - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);
    const app = $("bfApp");

    if (!app) return;

    const API_URL = "http://localhost:5278";

    const isOverview =
        app.dataset.view === "overzicht";

    const editingId = new URLSearchParams(
        window.location.search
    ).get("id");

    let transacties = [];
    let editingTransaction = null;
    let ready = false;
    let busy = false;

    const CATEGORIEEN = {
        uitgave: [
            "Materialen",
            "Veiligheid",
            "Vergunningen",
            "Communicatie",
            "Overig"
        ],
        inkomst: [
            "Inschrijvingen",
            "Sponsoring",
            "Donaties",
            "Overig"
        ]
    };

    const euro = value =>
        new Intl.NumberFormat("nl-NL", {
            style: "currency",
            currency: "EUR"
        }).format(value);

    const pageTitle = isOverview
        ? "Financiën"
        : editingId
            ? "Boeking bewerken"
            : "Boeking toevoegen";

    // ======================================
    // 1. API
    // ======================================

    async function request(
        path,
        method = "GET",
        data
    ) {

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
                "Je bent niet ingelogd."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Je hebt geen toegang. " +
                "De rol Penningmeester is vereist."
            );
        }

        if (!response.ok) {

            console.error(
                response.status,
                await response.text()
            );

            throw new Error(
                "API-fout: HTTP " + response.status
            );
        }

        if (response.status === 204) {

            return null;
        }

        return await response.json();
    }

    // ======================================
    // 2. HULPFUNCTIES
    // ======================================

    function element(tag, className = "", text) {

        const node = document.createElement(tag);

        if (className) {

            node.className = className;
        }

        if (text !== undefined) {

            node.textContent = String(text);
        }

        return node;
    }

    function cel(text, className = "") {

        return element(
            "td",
            className,
            text
        );
    }

    function meld(message) {

        $("bfFeedback").textContent = message;
    }

    function today() {

        const date = new Date();

        return date.getFullYear() + "-" +
            String(date.getMonth() + 1)
                .padStart(2, "0") + "-" +
            String(date.getDate())
                .padStart(2, "0");
    }

    function setOptions(select, values) {

        select.replaceChildren();

        [...new Set(values)]
            .filter(Boolean)
            .forEach(value => {

                select.add(
                    new Option(value, value)
                );
            });
    }

    function normalize(item) {

        return {
            id: item.transactieId,
            type: String(item.type || "")
                .toLowerCase(),
            datum: item.datum,
            bedrag: Number(item.bedrag),
            omschrijving: item.omschrijving || "",
            categorie: item.categorie || "",
            rekening: item.rekening || "",
            status: item.betaalstatus || "",
            factuur: item.factuur || "",
            inschrijvingId:
                item.inschrijvingId ?? null,
            betaling: item.betaling ?? null
        };
    }

    // ======================================
    // 3. OVERZICHT HTML
    // ======================================

    function overviewHTML() {

        return `
            <section class="bf-heading">

                <div>

                    <p class="bm-eyebrow">
                        FINANCIEEL BEHEER
                    </p>

                    <h1>Financiën</h1>

                    <p>
                        Overzicht van geregistreerde
                        inkomsten en uitgaven.
                    </p>

                </div>

                <a href="financien-boeking.html"
                   id="bfNewBooking"
                   class="bf-button bf-button-primary"
                   hidden>
                    + Nieuwe boeking
                </a>

            </section>

            <div class="bm-notice" role="note">

                <span class="bm-notice-icon">i</span>

                <div>

                    <strong id="bfNoticeTitle">
                        Financiële gegevens laden
                    </strong>

                    <p id="bfNoticeText">
                        De gegevens worden opgehaald.
                    </p>

                </div>

            </div>

            <section class="bf-stats">

                <article class="bf-stat">
                    <span>Ontvangen inkomsten</span>
                    <strong id="bfIncome">—</strong>
                    <small>Geregistreerde ontvangsten</small>
                </article>

                <article class="bf-stat">
                    <span>Betaalde uitgaven</span>
                    <strong id="bfExpenses">—</strong>
                    <small>Geregistreerde betalingen</small>
                </article>

                <article class="bf-stat">
                    <span>Nog te betalen uitgaven</span>
                    <strong id="bfPending">—</strong>
                    <small>Openstaande uitgaven</small>
                </article>

                <article class="bf-stat" id="bfResultCard">
                    <span>Resultaat</span>
                    <strong id="bfResult">—</strong>
                    <small>Inkomsten minus betaalde uitgaven</small>
                </article>

            </section>

            <section class="bf-panel">

                <div class="bf-panel-header">

                    <div>

                        <p class="bm-eyebrow">
                            BOEKHOUDING
                        </p>

                        <h2>Transactieoverzicht</h2>

                        <p>
                            Boekingen uit de database.
                        </p>

                    </div>

                    <button type="button"
                            class="bf-button bf-button-primary"
                            id="bfExport"
                            disabled>
                        Download CSV ↓
                    </button>

                </div>

                <div class="bf-filters">

                    <label class="bf-field">
                        Zoeken

                        <input type="search"
                               id="bfSearch"
                               placeholder="Zoek omschrijving">
                    </label>

                    <label class="bf-field">
                        Type

                        <select id="bfTypeFilter">
                            <option value="alle">
                                Alle transacties
                            </option>
                            <option value="inkomst">
                                Inkomsten
                            </option>
                            <option value="uitgave">
                                Uitgaven
                            </option>
                        </select>
                    </label>

                    <button type="button"
                            id="bfClear"
                            class="bf-button">
                        Filters wissen
                    </button>

                </div>

                <div class="bf-table-scroll">

                    <table class="bf-table">

                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Omschrijving</th>
                                <th>Type</th>
                                <th>Bedrag</th>
                                <th>Status</th>
                                <th>Inschrijving</th>
                                <th>Acties</th>
                            </tr>
                        </thead>

                        <tbody id="bfTableBody">
                        </tbody>

                    </table>

                </div>

                <p class="bf-table-footer"
                   id="bfCount">
                    Gegevens laden...
                </p>

            </section>

            <section class="bf-panel">

                <div class="bf-panel-header">

                    <div>

                        <p class="bm-eyebrow">
                            JAAROVERZICHT
                        </p>

                        <h2>Inkomsten en uitgaven</h2>

                        <p>
                            Maandelijkse geregistreerde
                            inkomsten en betaalde uitgaven.
                        </p>

                    </div>

                    <label class="bf-field">

                        Jaar

                        <select id="bfYear">
                        </select>

                    </label>

                </div>

                <div class="bf-chart-legend">

                    <span>
                        <i class="bf-legend-dot"></i>
                        Ontvangen inkomsten
                    </span>

                    <span>
                        <i class="bf-legend-dot is-expense"></i>
                        Betaalde uitgaven
                    </span>

                </div>

                <div class="bf-chart-scroll">

                    <div id="bfChart"
                         class="bf-chart">
                    </div>

                </div>

            </section>

            <section class="bf-panel">

                <div class="bf-panel-header">

                    <div>

                        <p class="bm-eyebrow">
                            BEGROTING
                        </p>

                        <h2>Budgetinformatie</h2>

                        <p>
                            Er is nog geen vastgesteld
                            budget gekoppeld.
                        </p>

                    </div>

                    <span class="bf-label">
                        Niet beschikbaar
                    </span>

                </div>

                <p class="bf-help">
                    Er worden geen fictieve budgetten
                    of banksaldi weergegeven.
                </p>

            </section>

            <p id="bfFeedback"
               class="bf-feedback"
               role="status"
               aria-live="polite">
            </p>
        `;
    }

    // ======================================
    // 4. BOEKINGSFORMULIER HTML
    // ======================================

    function bookingHTML() {

        return `
            <section class="bf-heading">

                <div>

                    <p class="bm-eyebrow">
                        FINANCIEEL BEHEER
                    </p>

                    <h1>${pageTitle}</h1>

                    <p>
                        Registreer een inkomstenboeking
                        of uitgave.
                    </p>

                </div>

                <a href="financien.html"
                   class="bf-button">
                    ← Financieel overzicht
                </a>

            </section>

            <div class="bm-notice" role="note">

                <span class="bm-notice-icon">i</span>

                <div>

                    <strong id="bfNoticeTitle">
                        Financiële registratie
                    </strong>

                    <p id="bfNoticeText">
                        Een boeking opslaan voert
                        geen echte betaling uit.
                    </p>

                </div>

            </div>

            <div class="bf-form-layout">

                <section class="bf-panel">

                    <div class="bf-panel-header">

                        <div>

                            <p class="bm-eyebrow">
                                BOEKINGSGEGEVENS
                            </p>

                            <h2>${pageTitle}</h2>

                        </div>

                    </div>

                    <form id="bfForm" class="bf-form">

                        <div class="bf-field">

                            <span>Type boeking</span>

                            <div class="bf-radio-group">

                                <label class="bf-radio-label">

                                    <input type="radio"
                                           name="bfType"
                                           value="uitgave"
                                           checked>
                                    Uitgave

                                </label>

                                <label class="bf-radio-label">

                                    <input type="radio"
                                           name="bfType"
                                           value="inkomst">
                                    Inkomst

                                </label>

                            </div>

                        </div>

                        <div class="bf-form-grid">

                            <label class="bf-field">

                                Datum *

                                <input type="date"
                                       id="bfDate"
                                       required>

                            </label>

                            <label class="bf-field">

                                Bedrag (€) *

                                <input type="number"
                                       id="bfAmount"
                                       min="0.01"
                                       max="1000000"
                                       step="0.01"
                                       required>

                            </label>

                        </div>

                        <label class="bf-field">

                            Omschrijving *

                            <input type="text"
                                   id="bfDescription"
                                   maxlength="150"
                                   required>

                        </label>

                        <div class="bf-form-grid">

                            <label class="bf-field">

                                Categorie *

                                <select id="bfCategory"
                                        required>
                                </select>

                            </label>

                            <label class="bf-field">

                                Rekening

                                <select id="bfAccount">

                                    <option>Betaalrekening</option>
                                    <option>Spaarrekening</option>
                                    <option>Kas</option>
                                    <option>Overig</option>

                                </select>

                            </label>

                        </div>

                        <label class="bf-field">

                            Betaalstatus *

                            <select id="bfStatus"
                                    required>
                            </select>

                        </label>

                        <label class="bf-field">

                            Inschrijving-ID (optioneel)

                            <input type="number"
                                   id="bfRegistration"
                                   min="1"
                                   step="1"
                                   placeholder="Leeg voor algemene boeking">

                        </label>

                        <label class="bf-field">

                            Factuurreferentie (optioneel)

                            <input type="text"
                                   id="bfInvoice"
                                   maxlength="150">

                        </label>

                        <div class="bf-form-actions">

                            <a href="financien.html"
                               class="bf-button">
                                Annuleren
                            </a>

                            <button type="submit"
                                    id="bfSave"
                                    class="bf-button bf-button-primary"
                                    disabled>
                                Boeking opslaan
                            </button>

                        </div>

                    </form>

                    <p id="bfFeedback"
                       class="bf-feedback"
                       role="status">
                    </p>

                </section>

                <aside>

                    <div class="bf-info-card">

                        <h3>Wat gebeurt er bij opslaan?</h3>

                        <p>
                            De boeking wordt opgeslagen
                            in PostgreSQL.
                        </p>

                    </div>

                    <div class="bf-info-card">

                        <h3>Betaald of openstaand?</h3>

                        <p>
                            De betaalstatus bepaalt hoe
                            de boeking wordt meegenomen
                            in het financiële overzicht.
                        </p>

                    </div>

                    <div class="bf-info-card">

                        <h3>Geen bankkoppeling</h3>

                        <p>
                            Er wordt geen geld overgemaakt.
                            De status wordt handmatig
                            geregistreerd.
                        </p>

                    </div>

                </aside>

            </div>
        `;
    }

    // ======================================
    // 5. GEDEELDE LAYOUT
    // ======================================

    app.innerHTML = `

        <div class="bm-layout">

            <aside class="bm-sidebar" id="bmSidebar">

                <a href="dashboard.html" class="bm-brand">

                    <span class="bm-brand-symbol">4</span>

                    <span>
                        <strong>AVOND4DAAGSE</strong>
                        <small>BEHEEROMGEVING 2027</small>
                    </span>

                </a>

                <div class="bm-sidebar-content">

                    <p class="bm-nav-label">OVERZICHT</p>

                    <nav class="bm-navigation">

                        <a href="dashboard.html">
                            <span class="bm-nav-icon">▦</span>
                            Dashboard
                        </a>

                        <a href="inschrijvingen.html">
                            <span class="bm-nav-icon">◎</span>
                            Inschrijvingen
                        </a>

                        <a href="routebeheer.html">
                            <span class="bm-nav-icon">◇</span>
                            Routebeheer
                        </a>

                        <a href="vrijwilligers.html">
                            <span class="bm-nav-icon">♧</span>
                            Vrijwilligers &amp; inzet
                        </a>

                        <a href="mijn-beschikbaarheid.html">
                            <span class="bm-nav-icon">◷</span>
                            Mijn beschikbaarheid
                        </a>

                        <a href="draaiboek.html">
                            <span class="bm-nav-icon">☷</span>
                            Draaiboek
                        </a>

                        <a href="financien.html"
                           class="bm-nav-active"
                           aria-current="page">

                            <span class="bm-nav-icon">€</span>
                            Financiën

                        </a>

                        <a href="contactvragen.html">
                            <span class="bm-nav-icon">✉</span>
                            Contactvragen
                        </a>

                    </nav>

                </div>

                <div class="bm-sidebar-footer">

                    <div class="bm-account">

                        <span class="bm-account-avatar">B</span>

                        <span>

                            <strong id="bfUserName">
                                Beheeromgeving
                            </strong>

                            <small id="bfUserRole">
                                Account laden...
                            </small>

                        </span>

                    </div>

                    <a href="login.html"
                       class="bm-sidebar-exit">

                        Terug naar inloggen ↗

                    </a>

                </div>

            </aside>

            <div class="bm-main-area">

                <header class="bm-topbar">

                    <div class="bm-topbar-left">

                        <button type="button"
                                class="bm-menu-button"
                                id="bmMenuButton"
                                aria-controls="bmSidebar"
                                aria-expanded="false">

                            ☰ Menu

                        </button>

                        <div class="bm-breadcrumb">

                            <span>Beheeromgeving</span>

                            <span>/</span>

                            <strong>${pageTitle}</strong>

                        </div>

                    </div>

                    <a href="../../index.html"
                       class="bm-website-link">

                        Bekijk publieke website ↗

                    </a>

                </header>

                <main class="bm-content">

                    ${
                        isOverview
                            ? overviewHTML()
                            : bookingHTML()
                    }

                    <footer class="bm-content-footer">

                        Avond4daagse 2027 · Financiën

                    </footer>

                </main>

            </div>

        </div>

        <div class="bm-backdrop"
             id="bmBackdrop"
             hidden>
        </div>
    `;

    // ======================================
    // 6. FINANCIËLE BEREKENINGEN
    // ======================================

    function isReceived(item) {

        return item.type === "inkomst" &&
            ["ontvangen", "betaald"].includes(
                item.status.toLowerCase()
            );
    }

    function isPaidExpense(item) {

        return item.type === "uitgave" &&
            item.status.toLowerCase() === "betaald";
    }

    function sum(items) {

        // Rekenen in centen voorkomt kleine
        // floating-point-afwijkingen.
        return items.reduce(
            (total, item) =>
                total + Math.round(item.bedrag * 100),
            0
        ) / 100;
    }

    function renderStats() {

        const income = sum(
            transacties.filter(isReceived)
        );

        const expenses = sum(
            transacties.filter(isPaidExpense)
        );

        const pending = sum(
            transacties.filter(item =>
                item.type === "uitgave" &&
                item.status.toLowerCase() ===
                    "nog te betalen"
            )
        );

        $("bfIncome").textContent = euro(income);

        $("bfExpenses").textContent = euro(expenses);

        $("bfPending").textContent = euro(pending);

        $("bfResult").textContent =
            euro(income - expenses);
    }

    // ======================================
    // 7. FILTERS
    // ======================================

    function visibleTransactions() {

        const query = $("bfSearch").value
            .trim()
            .toLowerCase();

        const type = $("bfTypeFilter").value;

        return transacties.filter(item => {

            const text = [
                item.omschrijving,
                item.categorie,
                item.factuur,
                item.inschrijvingId
            ].join(" ").toLowerCase();

            return text.includes(query) &&
                (
                    type === "alle" ||
                    item.type === type
                );

        }).sort((a, b) =>
            String(b.datum).localeCompare(
                String(a.datum)
            ) || b.id - a.id
        );
    }

    // ======================================
    // 8. TRANSACTIETABEL
    // ======================================

    function showTableMessage(message) {

        const body = $("bfTableBody");

        body.replaceChildren();

        const row = element("tr");
        const cell = cel(message, "bf-empty");

        cell.colSpan = 7;

        row.appendChild(cell);
        body.appendChild(row);
    }

    function renderTable() {

        if (!ready) return;

        const items = visibleTransactions();
        const body = $("bfTableBody");

        body.replaceChildren();

        if (!items.length) {

            showTableMessage(
                "Geen transacties gevonden."
            );
        }

        items.forEach(item => {

            const row = element("tr");

            const typeLabel =
                item.type === "inkomst"
                    ? "Inkomst"
                    : item.type === "uitgave"
                        ? "Uitgave"
                        : item.type || "Onbekend";

            const date = new Date(
                item.datum + "T12:00:00"
            ).toLocaleDateString("nl-NL");

            row.append(
                cel(date),
                cel(
                    item.omschrijving,
                    "bf-description"
                ),
                cel(typeLabel),
                cel(
                    (
                        item.type === "inkomst"
                            ? "+ "
                            : item.type === "uitgave"
                                ? "− "
                                : ""
                    ) + euro(item.bedrag),
                    item.type === "inkomst"
                        ? "bf-income"
                        : "bf-expense"
                )
            );

            const statusCell = element("td");

            statusCell.appendChild(
                element(
                    "span",
                    "bf-status" +
                    (
                        isReceived(item) ||
                        isPaidExpense(item)
                            ? ""
                            : " bf-status-pending"
                    ),
                    item.status || "Onbekend"
                )
            );

            row.appendChild(statusCell);

            row.appendChild(
                cel(
                    item.inschrijvingId !== null
                        ? "#" + item.inschrijvingId
                        : "Algemeen"
                )
            );

            const actions = element("td");

            const edit = element(
                "a",
                "bf-button",
                "Bewerken"
            );

            edit.href =
                "financien-boeking.html?id=" +
                encodeURIComponent(item.id);

            const remove = element(
                "button",
                "bf-button",
                "Verwijderen"
            );

            remove.type = "button";
            remove.disabled = busy;

            remove.addEventListener("click", () => {

                deleteTransaction(item);
            });

            actions.append(edit, remove);

            row.appendChild(actions);

            body.appendChild(row);
        });

        $("bfCount").textContent =
            items.length + " van " +
            transacties.length +
            " transacties getoond";

        $("bfExport").disabled =
            items.length === 0;
    }

    // ======================================
    // 9. MAANDGRAFIEK
    // ======================================

    function updateYears() {

        const select = $("bfYear");
        const previous = select.value;

        const years = [
            "2027",
            String(new Date().getFullYear()),
            ...transacties.map(item =>
                String(item.datum).slice(0, 4)
            )
        ];

        setOptions(
            select,
            [...new Set(years)].sort()
        );

        select.value = previous || "2027";

        if (select.selectedIndex === -1) {

            select.value = "2027";
        }
    }

    function renderChart() {

        const chart = $("bfChart");
        const year = $("bfYear").value;

        chart.replaceChildren();

        const months = [
            "Jan", "Feb", "Mrt", "Apr",
            "Mei", "Jun", "Jul", "Aug",
            "Sep", "Okt", "Nov", "Dec"
        ];

        const data = months.map((month, index) => {

            const datePrefix = year + "-" +
                String(index + 1).padStart(2, "0");

            const items = transacties.filter(item =>
                String(item.datum).startsWith(datePrefix)
            );

            return {
                month,
                income: sum(items.filter(isReceived)),
                expenses: sum(items.filter(isPaidExpense))
            };
        });

        const maximum = Math.max(
            1,
            ...data.flatMap(item => [
                item.income,
                item.expenses
            ])
        );

        chart.style.display = "grid";

        chart.style.gridTemplateColumns =
            "repeat(12, minmax(48px, 1fr))";

        chart.style.gap = "12px";

        chart.style.minWidth = "720px";

        data.forEach(item => {

            const group = element("div");

            const bars = element("div");

            Object.assign(bars.style, {
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: "5px",
                height: "160px"
            });

            [
                {
                    value: item.income,
                    color: "#287651",
                    label: "Inkomsten"
                },
                {
                    value: item.expenses,
                    color: "#c79045",
                    label: "Uitgaven"
                }
            ].forEach(series => {

                const bar = element("div");

                Object.assign(bar.style, {
                    width: "18px",
                    height: (
                        series.value / maximum * 100
                    ) + "%",
                    backgroundColor: series.color,
                    borderRadius: "4px 4px 0 0"
                });

                bar.title =
                    item.month + " — " +
                    series.label + ": " +
                    euro(series.value);

                bar.setAttribute(
                    "aria-label",
                    bar.title
                );

                bars.appendChild(bar);
            });

            const label = element(
                "p", "", item.month
            );

            label.style.textAlign = "center";

            group.append(bars, label);

            chart.appendChild(group);
        });
    }

    // ======================================
    // 10. GET
    // ======================================

    async function loadTransactions() {

        const data = await request(
            "/api/Transactie"
        );

        if (!Array.isArray(data)) {

            throw new Error(
                "Onverwacht API-antwoord."
            );
        }

        transacties = data.map(normalize);

        ready = true;

        renderStats();
        renderTable();
        updateYears();
        renderChart();

        $("bfNewBooking").hidden = false;

        $("bfNoticeTitle").textContent =
            "Financiën verbonden met de database";

        $("bfNoticeText").textContent =
            "De cijfers zijn gebaseerd op geregistreerde " +
            "transacties in PostgreSQL. Er is geen " +
            "bankkoppeling of online betaalverwerking.";
    }

    // ======================================
    // 11. DELETE
    // ======================================

    async function deleteTransaction(item) {

        if (!ready || busy) return;

        if (item.betaling) {

            alert(
                "Deze transactie heeft een gekoppeld " +
                "betalingsrecord en kan via dit scherm " +
                "niet worden verwijderd."
            );

            return;
        }

        const confirmed = window.confirm(
            'Wil je "' + item.omschrijving +
            '" definitief verwijderen?\n\n' +
            "Dit verwijdert de administratieve boeking."
        );

        if (!confirmed) return;

        busy = true;

        renderTable();

        try {

            await request(
                "/api/Transactie/" + item.id,
                "DELETE"
            );

            transacties = transacties.filter(
                transaction =>
                    transaction.id !== item.id
            );

            renderStats();
            renderChart();

            meld("Boeking verwijderd.");

        } catch (error) {

            meld(error.message);

        } finally {

            busy = false;

            renderTable();
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

    function exportCsv() {

        const items = visibleTransactions();

        if (!items.length) return;

        const rows = [
            [
                "Datum",
                "Omschrijving",
                "Type",
                "Bedrag",
                "Categorie",
                "Rekening",
                "Status",
                "Inschrijving",
                "Factuur"
            ],
            ...items.map(item => [
                item.datum,
                item.omschrijving,
                item.type,
                item.bedrag.toFixed(2).replace(".", ","),
                item.categorie,
                item.rekening,
                item.status,
                item.inschrijvingId ?? "",
                item.factuur
            ])
        ];

        const content = rows.map(row =>
            row.map(csvValue).join(";")
        ).join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + content],
            { type: "text/csv;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            "avond4daagse-financien.csv";

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );

        meld("CSV-bestand geëxporteerd.");
    }

    // ======================================
    // 13. FORMULIER
    // ======================================

    function currentType() {

        return document.querySelector(
            'input[name="bfType"]:checked'
        ).value;
    }

    function updateBookingOptions(item = null) {

        const type = currentType();

        const categories = [
            ...CATEGORIEEN[type]
        ];

        if (item?.categorie) {

            categories.push(item.categorie);
        }

        setOptions(
            $("bfCategory"),
            categories
        );

        const statuses = type === "inkomst"
            ? ["Ontvangen", "Nog te ontvangen"]
            : ["Betaald", "Nog te betalen"];

        if (item?.status) {

            statuses.push(item.status);
        }

        setOptions(
            $("bfStatus"),
            statuses
        );

        $("bfStatus").value =
            item?.status ||
            (
                type === "inkomst"
                    ? "Nog te ontvangen"
                    : "Nog te betalen"
            );

        if (item?.categorie) {

            $("bfCategory").value =
                item.categorie;
        }
    }

    async function initializeBooking() {

        $("bfDate").value = today();

        updateBookingOptions();

        document.querySelectorAll(
            'input[name="bfType"]'
        ).forEach(input => {

            input.addEventListener("change", () => {

                updateBookingOptions();
            });
        });

        if (editingId) {

            if (!/^\d+$/.test(editingId)) {

                throw new Error(
                    "Ongeldig transactie-ID."
                );
            }

            const data = await request(
                "/api/Transactie/" + editingId
            );

            const item = normalize(data);

            editingTransaction = item;

            if (item.betaling) {

                throw new Error(
                    "Deze transactie heeft een gekoppelde " +
                    "betaling. Bewerken via dit scherm " +
                    "wordt nog niet ondersteund."
                );
            }

            if (!["inkomst", "uitgave"].includes(item.type)) {

                throw new Error(
                    "Onbekend transactietype."
                );
            }

            document.querySelector(
                'input[name="bfType"][value="' +
                item.type + '"]'
            ).checked = true;

            updateBookingOptions(item);

            $("bfDate").value = item.datum;

            $("bfAmount").value = item.bedrag;

            $("bfDescription").value =
                item.omschrijving;

            const account = $("bfAccount");

            if (
                item.rekening &&
                ![...account.options].some(
                    option =>
                        option.value === item.rekening
                )
            ) {

                account.add(
                    new Option(
                        item.rekening,
                        item.rekening
                    )
                );
            }

            account.value =
                item.rekening || "Betaalrekening";

            $("bfRegistration").value =
                item.inschrijvingId ?? "";

            $("bfRegistration").readOnly = true;

            $("bfInvoice").value =
                item.factuur;
        }

        ready = true;

        $("bfSave").disabled = false;

        $("bfForm").addEventListener(
            "submit",
            saveTransaction
        );
    }

    // ======================================
    // 14. POST EN PUT
    // ======================================

    async function saveTransaction(event) {

        event.preventDefault();

        if (!ready || busy) return;

        const amount = Number(
            $("bfAmount").value
        );

        const description =
            $("bfDescription").value.trim();

        if (
            !description ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            amount > 1000000
        ) {

            meld(
                "Vul een geldige omschrijving " +
                "en bedrag in."
            );

            return;
        }

        const payload = {
            type: currentType(),
            datum: $("bfDate").value,
            bedrag: Math.round(amount * 100) / 100,
            omschrijving: description,
            categorie: $("bfCategory").value,
            rekening: $("bfAccount").value,
            betaalstatus: $("bfStatus").value,
            factuur: $("bfInvoice").value.trim(),
            betaling: null
        };

        if (!editingTransaction) {

            payload.inschrijvingId =
                $("bfRegistration").value
                    ? Number(
                        $("bfRegistration").value
                    )
                    : null;
        }

        busy = true;

        $("bfSave").disabled = true;

        meld("Boeking opslaan...");

        try {

            const path = editingTransaction
                ? "/api/Transactie/" +
                    editingTransaction.id
                : "/api/Transactie";

            await request(
                path,
                editingTransaction
                    ? "PUT"
                    : "POST",
                payload
            );

            window.location.href =
                "financien.html";

        } catch (error) {

            meld(error.message);

            busy = false;

            $("bfSave").disabled = false;
        }
    }

    // ======================================
    // 15. FILTEREVENTS
    // ======================================

    if (isOverview) {

        $("bfSearch").addEventListener(
            "input",
            renderTable
        );

        $("bfTypeFilter").addEventListener(
            "change",
            renderTable
        );

        $("bfClear").addEventListener(
            "click",
            () => {

                $("bfSearch").value = "";

                $("bfTypeFilter").value = "alle";

                renderTable();
            }
        );

        $("bfYear").addEventListener(
            "change",
            renderChart
        );

        $("bfExport").addEventListener(
            "click",
            exportCsv
        );
    }

    // ======================================
    // 16. AUTHENTICATIE EN START
    // ======================================

    async function initialize() {

        try {

            const user = await request(
                "/api/Auth/me"
            );

            const roles = user.rollen || [];

            $("bfUserName").textContent =
                user.naam || "Beheeromgeving";

            $("bfUserRole").textContent =
                roles.join(", ");

            if (!roles.includes("Penningmeester")) {

                throw new Error(
                    "De rol Penningmeester is vereist " +
                    "voor financiële gegevens."
                );
            }

            if (isOverview) {

                await loadTransactions();

            } else {

                await initializeBooking();
            }

        } catch (error) {

            ready = false;

            $("bfNoticeTitle").textContent =
                "Financiële gegevens niet beschikbaar";

            $("bfNoticeText").textContent =
                error.message;

            if (isOverview) {

                showTableMessage(error.message);

                $("bfCount").textContent =
                    "Geen gegevens geladen";

            } else {

                $("bfSave").disabled = true;

                $("bfForm").querySelectorAll(
                    "input, select, button"
                ).forEach(control => {

                    control.disabled = true;
                });
            }

            meld(error.message);
        }
    }

    initialize();

});
