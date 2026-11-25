
// ==========================================
// AVOND4DAAGSE 2027
// DRAAIBOEK - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);
    const app = $("dbpApp");

    if (!app) return;

    const view = app.dataset.view;

    const API_URL = "http://localhost:5278";

    const TEAMS = [
        "Coördinatie",
        "Startteam",
        "Hoofdorganisatie",
        "Finishteam",
        "Routecoördinator"
    ];

    const MOMENTS = [
        "Voorbereiding",
        "Tijdens de wandelavond",
        "Afronding"
    ];

    const STATUSES = [
        "Open",
        "Bezig",
        "Gereed"
    ];

    const EVENINGS = [
        "2027-06-01",
        "2027-06-02",
        "2027-06-03",
        "2027-06-04"
    ];

    const DEFAULT_DATE = "2027-06-03";

    let tasks = [];
    let users = [];
    let currentUser = null;

    let selectedDate = DEFAULT_DATE;
    let calendarMonth = "2027-06";

    let editingTask = null;
    let canEdit = false;
    let ready = false;
    let busy = false;

    const title = view === "mijn"
        ? "Mijn taken"
        : view === "maand"
            ? "Maandoverzicht"
            : "Draaiboek";

    // ======================================
    // 1. HULPFUNCTIES
    // ======================================

    function create(tag, className = "", text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = String(text);
        }

        return element;
    }

    function dateLabel(date) {

        const index = EVENINGS.indexOf(date);

        if (index !== -1) {

            return "Avond " + (index + 1) +
                " · " + date;
        }

        return new Date(date + "T12:00:00")
            .toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    function showMessage(message) {

        $("dbpFeedback").textContent = message;
    }

    function addOption(select, value, label) {

        select.add(
            new Option(label, value)
        );
    }

    function fillOptions(select, values, placeholder) {

        select.replaceChildren();

        if (placeholder !== undefined) {

            addOption(select, "", placeholder);
        }

        [...new Set(values)]
            .filter(Boolean)
            .forEach(value => {

                addOption(select, value, value);
            });
    }

    // ======================================
    // 2. API
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
                "Log opnieuw in."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Je hebt geen toestemming voor deze actie."
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
    // 3. PAGINA OPBOUWEN
    // ======================================

    app.innerHTML = `
        <div class="bm-layout">

            <aside class="bm-sidebar" id="bmSidebar">

                <a href="dashboard.html" class="bm-brand">

                    <span class="bm-brand-symbol"
                          aria-hidden="true">4</span>

                    <span>
                        <strong>AVOND4DAAGSE</strong>
                        <small>BEHEEROMGEVING 2027</small>
                    </span>

                </a>

                <div class="bm-sidebar-content">

                    <p class="bm-nav-label">OVERZICHT</p>

                    <nav class="bm-navigation"
                         aria-label="Beheernavigatie">

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

                        <a href="draaiboek.html"
                           class="bm-nav-active"
                           aria-current="page">
                            <span class="bm-nav-icon">☷</span>
                            Draaiboek
                        </a>

                        <a href="financien.html">
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
                            <strong id="dbpAccount">
                                Beheeromgeving
                            </strong>

                            <small id="dbpAccountRole">
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
                            <strong>${title}</strong>
                        </div>

                    </div>

                    <a href="../../index.html"
                       class="bm-website-link">
                        Bekijk publieke website ↗
                    </a>

                </header>

                <main class="bm-content">

                    <section class="dbp-heading">

                        <div>

                            <p class="bm-eyebrow">
                                ORGANISATIE · EDITIE 2027
                            </p>

                            <h1>${title}</h1>

                            <p>
                                Beheer werkzaamheden,
                                taaktoewijzingen en voortgang.
                            </p>

                        </div>

                        <button type="button"
                                id="dbpAdd"
                                class="dbp-btn dbp-btn-primary"
                                disabled>
                            + Taak toevoegen
                        </button>

                    </section>

                    <nav class="dbp-tabs">

                        <a href="draaiboek.html"
                           ${view === "dag"
                               ? 'class="is-active"'
                               : ""}>
                            Dag
                        </a>

                        <a href="draaiboek-maand.html"
                           ${view === "maand"
                               ? 'class="is-active"'
                               : ""}>
                            Maand
                        </a>

                        <a href="mijn-taken.html"
                           ${view === "mijn"
                               ? 'class="is-active"'
                               : ""}>
                            Mijn taken
                        </a>

                    </nav>

                    <div class="bm-notice" role="note">

                        <span class="bm-notice-icon">i</span>

                        <div>

                            <strong id="dbpNoticeTitle">
                                Draaiboek laden
                            </strong>

                            <p id="dbpNoticeText">
                                Databasegegevens worden opgehaald.
                            </p>

                        </div>

                    </div>

                    <section class="dbp-stats">

                        <article class="dbp-stat">
                            <span>Totaal taken</span>
                            <strong id="dbpTotal">—</strong>
                            <small id="dbpTotalLabel">
                                In dit overzicht
                            </small>
                        </article>

                        <article class="dbp-stat">
                            <span>Open of bezig</span>
                            <strong id="dbpActive">—</strong>
                            <small>Nog niet afgerond</small>
                        </article>

                        <article class="dbp-stat">
                            <span>Afgerond</span>
                            <strong id="dbpDone">—</strong>
                            <small>Status gereed</small>
                        </article>

                    </section>

                    <section class="dbp-toolbar">

                        <div class="dbp-filter-grid">

                            <label class="dbp-field"
                                   id="dbpDayWrap">
                                Datum
                                <input type="date"
                                       id="dbpDayFilter">
                            </label>

                            <label class="dbp-field dbp-field-search">
                                Zoeken
                                <input type="search"
                                       id="dbpSearch"
                                       placeholder="Zoek taak">
                            </label>

                            <label class="dbp-field">
                                Team
                                <select id="dbpTeamFilter">
                                </select>
                            </label>

                            <label class="dbp-field">
                                Moment
                                <select id="dbpMomentFilter">
                                </select>
                            </label>

                            <label class="dbp-field">
                                Status
                                <select id="dbpStatusFilter">
                                </select>
                            </label>

                        </div>

                        <div class="dbp-filter-grid">

                            <button type="button"
                                    id="dbpClearFilters"
                                    class="dbp-btn">
                                Filters wissen
                            </button>

                            <button type="button"
                                    id="dbpDuplicate"
                                    class="dbp-btn">
                                Dupliceer naar volgende dag
                            </button>

                            <button type="button"
                                    id="dbpPrint"
                                    class="dbp-btn">
                                Afdrukken / PDF
                            </button>

                        </div>

                    </section>

                    <section id="dbpCalendarPanel"
                             class="dbp-panel"
                             hidden>

                        <div class="dbp-panel-header">

                            <div>

                                <p class="bm-eyebrow">
                                    MAANDOVERZICHT
                                </p>

                                <h2 id="dbpCalendarTitle">
                                    Kalender
                                </h2>

                                <p>
                                    Selecteer een dag om
                                    de taken te bekijken.
                                </p>

                            </div>

                            <label class="dbp-field">
                                Maand
                                <input type="month"
                                       id="dbpMonth">
                            </label>

                        </div>

                        <div id="dbpCalendar"
                             class="dbp-calendar">
                        </div>

                    </section>

                    <div id="dbpMainLayout"
                         class="dbp-layout">

                        <section class="dbp-panel">

                            <div class="dbp-panel-header">

                                <div>

                                    <p class="bm-eyebrow">
                                        TAKENOVERZICHT
                                    </p>

                                    <h2 id="dbpListTitle">
                                        Taken
                                    </h2>

                                    <p id="dbpListSubtitle">
                                        Werkzaamheden
                                    </p>

                                </div>

                                <span class="dbp-count"
                                      id="dbpListCount">
                                    0 taken
                                </span>

                            </div>

                            <div id="dbpTaskList"
                                 class="dbp-task-list">
                            </div>

                        </section>

                        <aside class="dbp-side-panel">

                            <h3>Voortgang</h3>

                            <strong id="dbpProgressText">
                                0 / 0
                            </strong>

                            <div class="dbp-progress-track">

                                <span id="dbpProgressFill">
                                </span>

                            </div>

                            <p id="dbpProgressDescription">
                                Taken afgerond.
                            </p>

                            <p style="margin-top:20px">
                                Neem bij een noodgeval
                                contact op met de
                                evenementcoördinator.
                                Bel bij direct gevaar 112.
                            </p>

                        </aside>

                    </div>

                    <p id="dbpFeedback"
                       class="dbp-feedback"
                       role="status"
                       aria-live="polite">
                    </p>

                    <footer class="bm-content-footer">
                        Avond4daagse 2027 · Draaiboek
                    </footer>

                </main>

            </div>

        </div>

        <dialog id="dbpModal"
                class="dbp-dialog">

            <div class="dbp-dialog-heading">

                <div>

                    <p class="bm-eyebrow">
                        TAAKGEGEVENS
                    </p>

                    <h2 id="dbpModalTitle">
                        Taak toevoegen
                    </h2>

                </div>

                <button type="button"
                        class="dbp-close"
                        id="dbpCloseModal">
                    ×
                </button>

            </div>

            <form id="dbpForm"
                  class="dbp-form">

                <label>
                    Taaknaam

                    <input id="dbpTaskTitle"
                           type="text"
                           maxlength="150"
                           required>
                </label>

                <label>
                    Omschrijving

                    <textarea id="dbpTaskDescription"
                              rows="3">
                    </textarea>
                </label>

                <div class="dbp-form-grid">

                    <label class="dbp-field">
                        Datum

                        <input type="date"
                               id="dbpTaskDate"
                               required>
                    </label>

                    <label class="dbp-field">
                        Verantwoordelijk team

                        <select id="dbpTaskTeam">
                        </select>
                    </label>

                </div>

                <div class="dbp-form-grid">

                    <label class="dbp-field">
                        Moment

                        <select id="dbpTaskMoment">
                        </select>
                    </label>

                    <label class="dbp-field">
                        Status

                        <select id="dbpTaskStatus">
                        </select>
                    </label>

                </div>

                <label>
                    Gebruikers toewijzen

                    <select id="dbpTaskUsers"
                            multiple
                            size="4">
                    </select>
                </label>

                <small>
                    Houd Cmd ingedrukt om meerdere
                    gebruikers te selecteren.
                </small>

                <p id="dbpFormFeedback"
                   role="status">
                </p>

                <div class="dbp-form-actions">

                    <button type="button"
                            id="dbpCancelModal"
                            class="dbp-btn">
                        Annuleren
                    </button>

                    <button type="submit"
                            id="dbpSaveTask"
                            class="dbp-btn dbp-btn-primary">
                        Taak opslaan
                    </button>

                </div>

            </form>

        </dialog>

        <div class="bm-backdrop"
             id="bmBackdrop"
             hidden></div>
    `;

    // ======================================
    // 4. ELEMENTEN
    // ======================================

    const dialog = $("dbpModal");
    const taskForm = $("dbpForm");

    const dayFilter = $("dbpDayFilter");
    const teamFilter = $("dbpTeamFilter");
    const momentFilter = $("dbpMomentFilter");
    const statusFilter = $("dbpStatusFilter");
    const searchInput = $("dbpSearch");

    const formTeam = $("dbpTaskTeam");
    const formMoment = $("dbpTaskMoment");
    const formStatus = $("dbpTaskStatus");
    const formUsers = $("dbpTaskUsers");

    dayFilter.value = DEFAULT_DATE;

    $("dbpMonth").value = calendarMonth;

    if (view === "maand") {

        $("dbpCalendarPanel").hidden = false;
        $("dbpDayWrap").hidden = true;

        $("dbpMainLayout").className =
            "dbp-calendar-layout";
    }

    if (view === "mijn") {

        dayFilter.value = "";
    }

    // ======================================
    // 5. GEGEVENS NORMALISEREN
    // ======================================

    function normalize(task) {

        return {
            id: task.taakId,
            titel: task.titel || "",
            omschrijving:
                task.beschrijving || "",
            datum: task.datum,
            team:
                task.verantwoordelijke || "",
            moment:
                task.categorie || "",
            status:
                task.status || "Onbekend",
            gebruikerIds:
                Array.isArray(task.gebruikerIds)
                    ? task.gebruikerIds.map(Number)
                    : []
        };
    }

    function toPayload(task) {

        return {
            titel: task.titel,
            beschrijving: task.omschrijving,
            datum: task.datum,
            categorie: task.moment,
            status: task.status,
            verantwoordelijke: task.team,
            gebruikerIds: task.gebruikerIds
        };
    }

    function isPersonal(task) {

        return currentUser &&
            task.gebruikerIds.includes(
                Number(currentUser.gebruikerId)
            );
    }

    // ======================================
    // 6. FILTEROPTIES
    // ======================================

    function refreshOptions() {

        const currentTeam = teamFilter.value;
        const currentMoment = momentFilter.value;
        const currentStatus = statusFilter.value;

        const teams = [
            ...TEAMS,
            ...tasks.map(task => task.team)
        ];

        const moments = [
            ...MOMENTS,
            ...tasks.map(task => task.moment)
        ];

        const statuses = [
            ...STATUSES,
            ...tasks.map(task => task.status)
        ];

        fillOptions(
            teamFilter,
            teams,
            "Alle teams"
        );

        fillOptions(
            momentFilter,
            moments,
            "Alle momenten"
        );

        fillOptions(
            statusFilter,
            statuses,
            "Alle statussen"
        );

        fillOptions(formTeam, teams, "Geen team");
        fillOptions(formMoment, moments, "Geen moment");
        fillOptions(formStatus, statuses);

        teamFilter.value = currentTeam;
        momentFilter.value = currentMoment;
        statusFilter.value = currentStatus;

        formUsers.replaceChildren();

        users.forEach(user => {

            addOption(
                formUsers,
                user.gebruikerId,
                user.naam + " (#" +
                user.gebruikerId + ")"
            );
        });
    }

    // ======================================
    // 7. API GEGEVENS LADEN
    // ======================================

    async function loadTasks() {

        const data = await request(
            "/api/Draaiboek"
        );

        if (!Array.isArray(data)) {

            throw new Error(
                "Onverwacht API-antwoord."
            );
        }

        tasks = data.map(normalize);

        refreshOptions();

        render();
    }

    async function initialize() {

        try {

            currentUser = await request(
                "/api/Auth/me"
            );

            if (!currentUser.gebruikerId) {

                throw new Error(
                    "Gebruikers-ID ontbreekt. " +
                    "Controleer AuthController."
                );
            }

            const roles =
                currentUser.rollen || [];

            canEdit = roles.includes(
                "Voorzitter"
            );

            $("dbpAccount").textContent =
                currentUser.naam ||
                "Beheeromgeving";

            $("dbpAccountRole").textContent =
                roles.join(", ");

            if (canEdit) {

                users = await request(
                    "/api/Gebruiker"
                );

                if (!Array.isArray(users)) {

                    throw new Error(
                        "Gebruikers konden niet worden geladen."
                    );
                }
            }

            await loadTasks();

            ready = true;

            $("dbpNoticeTitle").textContent =
                "Draaiboek verbonden met de database";

            $("dbpNoticeText").textContent =
                "Taken worden centraal opgeslagen. " +
                "De vier wandelavonden in juni zijn " +
                "voorlopige planningsdatums. " +
                (
                    canEdit
                        ? "Je kunt taken beheren en toewijzen."
                        : "Je hebt alleen leestoegang."
                );

            render();

        } catch (error) {

            ready = false;

            $("dbpNoticeTitle").textContent =
                "Draaiboek ophalen mislukt";

            $("dbpNoticeText").textContent =
                error.message;

            showMessage(error.message);
        }
    }

    // ======================================
    // 8. FILTEREN
    // ======================================

    function getScopeTasks() {

        if (view === "mijn") {

            return tasks.filter(isPersonal);
        }

        if (view === "dag") {

            return tasks.filter(task =>
                task.datum === selectedDate
            );
        }

        return tasks.filter(task =>
            task.datum.startsWith(calendarMonth)
        );
    }

    function getVisibleTasks() {

        const query = searchInput.value
            .trim()
            .toLowerCase();

        return getScopeTasks().filter(task => {

            const text = [
                task.titel,
                task.omschrijving,
                task.team,
                task.moment
            ].join(" ").toLowerCase();

            const dateMatches =
                view === "maand"
                    ? task.datum === selectedDate
                    : view === "mijn"
                        ? !dayFilter.value ||
                          task.datum === dayFilter.value
                        : true;

            return (
                dateMatches &&
                text.includes(query) &&
                (
                    !teamFilter.value ||
                    task.team === teamFilter.value
                ) &&
                (
                    !momentFilter.value ||
                    task.moment === momentFilter.value
                ) &&
                (
                    !statusFilter.value ||
                    task.status === statusFilter.value
                )
            );
        });
    }

    // ======================================
    // 9. STATISTIEKEN
    // ======================================

    function renderStats() {

        const items = getScopeTasks();

        const done = items.filter(task =>
            task.status === "Gereed"
        ).length;

        $("dbpTotal").textContent =
            items.length;

        $("dbpActive").textContent =
            items.length - done;

        $("dbpDone").textContent = done;

        $("dbpTotalLabel").textContent =
            view === "mijn"
                ? "Persoonlijke taken"
                : view === "maand"
                    ? "Taken in deze maand"
                    : "Taken op deze datum";
    }

    // ======================================
    // 10. STATUS WIJZIGEN
    // ======================================

    async function changeStatus(task, status) {

        if (!canEdit || !ready || busy) return;

        busy = true;

        render();

        try {

            await request(
                "/api/Draaiboek/" + task.id,
                "PUT",
                toPayload({
                    ...task,
                    status
                })
            );

            await loadTasks();

            showMessage(
                "Taakstatus bijgewerkt."
            );

        } catch (error) {

            showMessage(error.message);

        } finally {

            busy = false;
            render();
        }
    }

    // ======================================
    // 11. TAAKKAARTEN
    // ======================================

    function renderTaskCard(task) {

        const card = create(
            "article",
            "dbp-task-card"
        );

        if (task.status === "Gereed") {

            card.classList.add("is-done");
        }

        const head = create(
            "div",
            "dbp-task-head"
        );

        const info = create("div");

        if (view !== "dag") {

            info.appendChild(
                create(
                    "span",
                    "dbp-task-date",
                    dateLabel(task.datum)
                )
            );
        }

        info.appendChild(
            create("h3", "", task.titel)
        );

        head.appendChild(info);

        card.appendChild(head);

        if (task.omschrijving) {

            card.appendChild(
                create(
                    "p",
                    "dbp-task-description",
                    task.omschrijving
                )
            );
        }

        const meta = create(
            "div",
            "dbp-task-meta"
        );

        [
            task.team || "Geen team",
            task.moment || "Geen moment"
        ].forEach(value => {

            meta.appendChild(
                create("span", "", value)
            );
        });

        if (isPersonal(task)) {

            meta.appendChild(
                create("span", "", "Mijn taak")
            );
        }

        if (task.gebruikerIds.length) {

            const names = task.gebruikerIds.map(id => {

                const user = users.find(item =>
                    Number(item.gebruikerId) === id
                );

                return user
                    ? user.naam
                    : "Gebruiker #" + id;
            });

            meta.appendChild(
                create(
                    "span",
                    "",
                    "Toegewezen: " + names.join(", ")
                )
            );
        }

        card.appendChild(meta);

        const actions = create(
            "div",
            "dbp-task-actions"
        );

        const status = create(
            "select",
            "dbp-status-select"
        );

        fillOptions(
            status,
            [...STATUSES, task.status]
        );

        status.value = task.status;

        status.disabled =
            !canEdit || !ready || busy;

        status.setAttribute(
            "aria-label",
            "Status van " + task.titel
        );

        status.addEventListener("change", () => {

            changeStatus(task, status.value);
        });

        actions.appendChild(status);

        if (canEdit) {

            const edit = create(
                "button",
                "dbp-btn",
                "Bewerken"
            );

            edit.type = "button";
            edit.disabled = busy || !ready;

            edit.addEventListener("click", () => {

                openForm(task);
            });

            const remove = create(
                "button",
                "dbp-btn dbp-btn-danger",
                "Verwijderen"
            );

            remove.type = "button";
            remove.disabled = busy || !ready;

            remove.addEventListener("click", () => {

                removeTask(task);
            });

            actions.append(edit, remove);
        }

        card.appendChild(actions);

        return card;
    }

    // ======================================
    // 12. TAKENLIJST
    // ======================================

    function renderTaskList() {

        const visible = getVisibleTasks();

        const list = $("dbpTaskList");

        list.replaceChildren();

        $("dbpListTitle").textContent =
            view === "mijn"
                ? "Mijn taken"
                : dateLabel(selectedDate);

        $("dbpListSubtitle").textContent =
            view === "mijn"
                ? "Taken die aan jouw account zijn toegewezen."
                : "Werkzaamheden voor deze datum.";

        $("dbpListCount").textContent =
            visible.length + " zichtbaar";

        if (!visible.length) {

            list.appendChild(
                create(
                    "p",
                    "dbp-empty",
                    "Geen taken gevonden."
                )
            );

        } else {

            const moments = [
                ...new Set([
                    ...MOMENTS,
                    ...visible.map(task => task.moment)
                ])
            ];

            moments.forEach(moment => {

                const items = visible.filter(task =>
                    task.moment === moment
                );

                if (!items.length) return;

                list.appendChild(
                    create(
                        "h3",
                        "dbp-group-heading",
                        moment || "Overige taken"
                    )
                );

                items.forEach(task => {

                    list.appendChild(
                        renderTaskCard(task)
                    );
                });
            });
        }

        const scope = getScopeTasks().filter(task =>
            view !== "maand" ||
            task.datum === selectedDate
        );

        const done = scope.filter(task =>
            task.status === "Gereed"
        ).length;

        $("dbpProgressText").textContent =
            done + " / " + scope.length;

        $("dbpProgressFill").style.width =
            (
                scope.length
                    ? done / scope.length * 100
                    : 0
            ) + "%";

        $("dbpProgressDescription").textContent =
            done + " van " + scope.length +
            " taken zijn afgerond.";
    }

    // ======================================
    // 13. MAANDKALENDER
    // ======================================

    function renderCalendar() {

        if (view !== "maand") return;

        const calendar = $("dbpCalendar");

        calendar.replaceChildren();

        const [year, month] =
            calendarMonth.split("-").map(Number);

        const first = new Date(
            year,
            month - 1,
            1
        );

        const days = new Date(
            year,
            month,
            0
        ).getDate();

        $("dbpCalendarTitle").textContent =
            first.toLocaleDateString("nl-NL", {
                month: "long",
                year: "numeric"
            });

        ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
            .forEach(label => {

                calendar.appendChild(
                    create(
                        "span",
                        "dbp-weekday",
                        label
                    )
                );
            });

        const offset =
            (first.getDay() + 6) % 7;

        for (let i = 0; i < offset; i++) {

            calendar.appendChild(
                create(
                    "span",
                    "dbp-calendar-spacer"
                )
            );
        }

        for (let day = 1; day <= days; day++) {

            const date = calendarMonth + "-" +
                String(day).padStart(2, "0");

            const count = tasks.filter(task =>
                task.datum === date
            ).length;

            const button = create(
                "button",
                "dbp-calendar-day"
            );

            button.type = "button";

            button.classList.toggle(
                "is-selected",
                selectedDate === date
            );

            button.setAttribute(
                "aria-pressed",
                String(selectedDate === date)
            );

            button.append(
                create("strong", "", day),
                create(
                    "small",
                    "",
                    count
                        ? count + " taken"
                        : "Geen taken"
                )
            );

            button.addEventListener("click", () => {

                selectedDate = date;

                render();
            });

            calendar.appendChild(button);
        }
    }

    function render() {

        renderStats();
        renderCalendar();
        renderTaskList();

        $("dbpAdd").hidden = !canEdit;

        $("dbpAdd").disabled =
            busy || !ready;

        $("dbpDuplicate").hidden =
            view !== "dag" || !canEdit;

        $("dbpDuplicate").disabled =
            busy || !ready;

        if (view === "dag") {

            dayFilter.value = selectedDate;
        }
    }

    // ======================================
    // 14. FORMULIER
    // ======================================

    function openForm(task = null) {

        if (!canEdit || busy || !ready) return;

        taskForm.reset();

        editingTask = task;

        $("dbpModalTitle").textContent =
            task ? "Taak bewerken" : "Taak toevoegen";

        $("dbpTaskTitle").value =
            task?.titel || "";

        $("dbpTaskDescription").value =
            task?.omschrijving || "";

        $("dbpTaskDate").value =
            task?.datum || selectedDate;

        formTeam.value =
            task?.team ?? TEAMS[0];

        formMoment.value =
            task?.moment ?? MOMENTS[0];

        formStatus.value =
            task?.status || "Open";

        const assigned = task
            ? task.gebruikerIds
            : view === "mijn"
                ? [Number(currentUser.gebruikerId)]
                : [];

        [...formUsers.options].forEach(option => {

            option.selected = assigned.includes(
                Number(option.value)
            );
        });

        $("dbpFormFeedback").textContent = "";

        dialog.showModal();
    }

    $("dbpAdd").addEventListener("click", () => {

        openForm();
    });

    function closeForm() {

        if (busy) return;

        dialog.close();
        editingTask = null;
    }

    $("dbpCloseModal").addEventListener(
        "click",
        closeForm
    );

    $("dbpCancelModal").addEventListener(
        "click",
        closeForm
    );

    dialog.addEventListener("cancel", event => {

        if (busy) event.preventDefault();
    });

    // ======================================
    // 15. POST EN PUT
    // ======================================

    taskForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!canEdit || !ready || busy) return;

            const task = {
                titel:
                    $("dbpTaskTitle").value.trim(),

                omschrijving:
                    $("dbpTaskDescription").value.trim(),

                datum:
                    $("dbpTaskDate").value,

                team:
                    formTeam.value,

                moment:
                    formMoment.value,

                status:
                    formStatus.value,

                gebruikerIds:
                    [...formUsers.selectedOptions]
                        .map(option =>
                            Number(option.value)
                        )
            };

            if (!task.titel || !task.datum) {

                $("dbpFormFeedback").textContent =
                    "Vul een taaknaam en datum in.";

                return;
            }

            busy = true;

            $("dbpSaveTask").disabled = true;

            try {

                const path = editingTask
                    ? "/api/Draaiboek/" + editingTask.id
                    : "/api/Draaiboek";

                await request(
                    path,
                    editingTask ? "PUT" : "POST",
                    toPayload(task)
                );

                selectedDate = task.datum;

                calendarMonth =
                    task.datum.slice(0, 7);

                $("dbpMonth").value =
                    calendarMonth;

                dialog.close();

                editingTask = null;

                searchInput.value = "";
                teamFilter.value = "";
                momentFilter.value = "";
                statusFilter.value = "";

                if (view === "mijn") {

                    dayFilter.value = "";
                }

                await loadTasks();

                showMessage(
                    "Taak opgeslagen in de database."
                );

            } catch (error) {

                if (dialog.open) {

                    $("dbpFormFeedback").textContent =
                        error.message;

                } else {

                    showMessage(
                        "Taak opgeslagen, maar overzicht " +
                        "vernieuwen mislukt: " +
                        error.message
                    );
                }

            } finally {

                busy = false;

                $("dbpSaveTask").disabled = false;

                render();
            }
        }
    );

    // ======================================
    // 16. DELETE
    // ======================================

    async function removeTask(task) {

        if (!canEdit || busy || !ready) return;

        const confirmed = window.confirm(
            'Wil je "' + task.titel +
            '" definitief verwijderen uit de database?'
        );

        if (!confirmed) return;

        busy = true;

        render();

        try {

            await request(
                "/api/Draaiboek/" + task.id,
                "DELETE"
            );

            tasks = tasks.filter(
                item => item.id !== task.id
            );

            showMessage(
                "Taak verwijderd."
            );

        } catch (error) {

            showMessage(error.message);

        } finally {

            busy = false;

            render();
        }
    }

    // ======================================
    // 17. TAKEN DUPLICEREN
    // ======================================

    $("dbpDuplicate").addEventListener(
        "click",
        async () => {

            if (!canEdit || !ready || busy) return;

            const source = tasks.filter(task =>
                task.datum === selectedDate
            );

            if (!source.length) {

                showMessage(
                    "Er zijn geen taken om te dupliceren."
                );

                return;
            }

            const date = new Date(
                selectedDate + "T12:00:00Z"
            );

            date.setUTCDate(
                date.getUTCDate() + 1
            );

            const nextDate =
                date.toISOString().slice(0, 10);

            const confirmed = window.confirm(
                source.length +
                " taken kopiëren naar " + nextDate +
                "?\n\nDe nieuwe taken krijgen status Open."
            );

            if (!confirmed) return;

            busy = true;

            render();

            let created = 0;

            try {

                for (const task of source) {

                    await request(
                        "/api/Draaiboek",
                        "POST",
                        toPayload({
                            ...task,
                            datum: nextDate,
                            status: "Open",
                            gebruikerIds: []
                        })
                    );

                    created++;
                }

                selectedDate = nextDate;

                await loadTasks();

                showMessage(
                    created + " taken gekopieerd."
                );

            } catch (error) {

                try {
                    await loadTasks();
                } catch {}

                showMessage(
                    created + " taken gekopieerd. " +
                    "Daarna ontstond een fout: " +
                    error.message
                );

            } finally {

                busy = false;

                render();
            }
        }
    );

    // ======================================
    // 18. FILTEREVENTS
    // ======================================

    dayFilter.addEventListener("change", () => {

        if (view === "dag" && dayFilter.value) {

            selectedDate = dayFilter.value;
        }

        render();
    });

    $("dbpMonth").addEventListener(
        "change",
        event => {

            if (!event.target.value) return;

            calendarMonth =
                event.target.value;

            selectedDate =
                calendarMonth + "-01";

            render();
        }
    );

    [
        searchInput,
        teamFilter,
        momentFilter,
        statusFilter
    ].forEach(control => {

        control.addEventListener(
            control === searchInput
                ? "input"
                : "change",
            render
        );
    });

    $("dbpClearFilters").addEventListener(
        "click",
        () => {

            searchInput.value = "";
            teamFilter.value = "";
            momentFilter.value = "";
            statusFilter.value = "";

            if (view === "mijn") {

                dayFilter.value = "";
            }

            render();
        }
    );

    $("dbpPrint").addEventListener(
        "click",
        () => window.print()
    );

    // ======================================
    // 19. ACTUEEL OVERZICHT
    // ======================================

    window.addEventListener("focus", async () => {

        if (!ready || busy || dialog.open) return;

        try {

            await loadTasks();

        } catch (error) {

            showMessage(error.message);
        }
    });

    // ======================================
    // 20. START
    // ======================================

    initialize();

});
