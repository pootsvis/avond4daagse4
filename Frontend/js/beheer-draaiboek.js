
// ==========================================
// AVOND4DAAGSE 2027
// DRAAIBOEK - DAG, MAAND EN MIJN TAKEN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const app = document.getElementById("dbpApp");

  if (!app) return;

  const view = app.dataset.view;

  if (!["dag", "maand", "mijn"].includes(view)) {
    return;
  }

  const KEY = "avond4daagse-draaiboek-dag-demo";

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

  const STATUSES = ["Open", "Bezig", "Gereed"];

  const DEFAULT_DATE = "2027-06-03";

  const EVENINGS = [
    "2027-06-01",
    "2027-06-02",
    "2027-06-03",
    "2027-06-04"
  ];

  // Bestaande voorbeeldtaken uit de repository.
  const DEFAULT_TASKS = {
    "2027-06-01": [],
    "2027-06-02": [],
    "2027-06-03": [
      {
        id: 1,
        titel: "Terrein openen",
        omschrijving:
          "Hekken openen, stroom en portofoons controleren.",
        team: "Coördinatie",
        moment: "Voorbereiding",
        status: "Gereed"
      },
      {
        id: 2,
        titel: "Opbouw startbureau",
        omschrijving:
          "Tafels, startlijsten en stempelkaarten klaarleggen.",
        team: "Startteam",
        moment: "Voorbereiding",
        status: "Bezig"
      },
      {
        id: 3,
        titel: "Briefing vrijwilligers",
        omschrijving:
          "Laatste routewijzigingen en veiligheidsafspraken.",
        team: "Hoofdorganisatie",
        moment: "Voorbereiding",
        status: "Open"
      },
      {
        id: 4,
        titel: "Start 10 km",
        omschrijving:
          "Startvak openen en eerste groep laten vertrekken.",
        team: "Startteam",
        moment: "Tijdens de wandelavond",
        status: "Open"
      },
      {
        id: 5,
        titel: "Start 5 km",
        omschrijving:
          "Groepen per school gefaseerd laten vertrekken.",
        team: "Startteam",
        moment: "Tijdens de wandelavond",
        status: "Open"
      },
      {
        id: 6,
        titel: "Eerste finishers",
        omschrijving:
          "Waterpunten en stempelpost volledig bemand.",
        team: "Finishteam",
        moment: "Tijdens de wandelavond",
        status: "Open"
      },
      {
        id: 7,
        titel: "Route vrijmelden",
        omschrijving:
          "Alle posten bellen en deelnemersaantallen bevestigen.",
        team: "Routecoördinator",
        moment: "Afronding",
        status: "Open"
      }
    ],
    "2027-06-04": []
  };

  // Alleen deze drie bestaande taken waren al
  // aan de voorbeeldgebruiker toegewezen.
  const PERSONAL_DEMO_IDS = new Set(["1", "3", "7"]);


  // ========================================
  // 1. HULPFUNCTIES
  // ========================================

  const $ = id => document.getElementById(id);

  function dateKey(day) {
    return "2027-06-" + String(day).padStart(2, "0");
  }

  function dayNumber(date) {
    return Number(date.slice(-2));
  }

  function dateLabel(date) {
    const day = dayNumber(date);

    if (day >= 1 && day <= 4) {
      return "Avond " + day + " (demo)";
    }

    return day + " juni 2027";
  }

  function create(tag, className = "", content) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (content !== undefined) {
      element.textContent = String(content);
    }

    return element;
  }

  function makeId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return "taak-" + Date.now() + "-" +
      Math.random().toString(36).slice(2);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }


  // ========================================
  // 2. BEWARENDE OPSLAG COMPATIBEL HOUDEN
  // ========================================

  function normalizeTask(task) {
    if (!task || typeof task !== "object") {
      return null;
    }

    const title = String(task.titel || "").trim();

    if (!title) return null;

    return {
      id: task.id ?? makeId(),
      titel: title.slice(0, 100),
      omschrijving: String(
        task.omschrijving || ""
      ).slice(0, 800),
      team: TEAMS.includes(task.team)
        ? task.team
        : TEAMS[0],
      moment: MOMENTS.includes(task.moment)
        ? task.moment
        : MOMENTS[0],
      status: STATUSES.includes(task.status)
        ? task.status
        : "Open",
      eigen: task.eigen === true
    };
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(KEY);

      if (saved === null) {
        return clone(DEFAULT_TASKS);
      }

      const parsed = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return clone(DEFAULT_TASKS);
      }

      const result = {};

      // Ook bestaande taken op andere dagen
      // van juni blijven bewaard.
      for (let day = 1; day <= 30; day++) {
        const key = dateKey(day);
        const list = parsed[key];

        result[key] = Array.isArray(list)
          ? list.map(normalizeTask).filter(Boolean)
          : [];
      }

      return result;

    } catch (error) {
      console.warn("Draaiboek kon niet geladen worden.", error);
      return clone(DEFAULT_TASKS);
    }
  }

  let tasks = loadTasks();
  let selectedDate = DEFAULT_DATE;
  let editingId = null;

  // Eerst opslaan, daarna de schermgegevens
  // aanpassen. Zo blijft de vorige toestand
  // behouden als opslaan mislukt.
  function updateTasks(change, successMessage) {
    const next = clone(tasks);

    change(next);

    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      tasks = next;

      render();
      showMessage(successMessage);
      return true;

    } catch (error) {
      console.warn("Opslaan mislukt.", error);

      showMessage(
        "Opslaan is mislukt. Er is niets gewijzigd. " +
        "Controleer de browseropslag."
      );

      return false;
    }
  }

  function showMessage(message) {
    $("dbpFeedback").textContent = message;
  }

  function allItems() {
    return Object.entries(tasks).flatMap(
      ([date, list]) =>
        list.map(task => ({ date, task }))
    );
  }

  function isPersonal(item) {
    return item.task.eigen === true ||
      (
        item.date === DEFAULT_DATE &&
        PERSONAL_DEMO_IDS.has(String(item.task.id))
      );
  }


  // ========================================
  // 3. PAGINAOPBOUW
  // ========================================

  const title = view === "mijn"
    ? "Mijn taken"
    : view === "maand"
      ? "Maandoverzicht"
      : "Draaiboek";

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
              <span class="bm-nav-icon"
                    aria-hidden="true">▦</span>
              Dashboard
            </a>

            <a href="inschrijvingen.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">◎</span>
              Inschrijvingen
            </a>

            <a href="routebeheer.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">◇</span>
              Routebeheer
            </a>

            <a href="vrijwilligers.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">♧</span>
              Vrijwilligers &amp; inzet
            </a>

            <a href="mijn-beschikbaarheid.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">◷</span>
              Mijn beschikbaarheid
            </a>

            <a href="draaiboek.html"
               class="bm-nav-active"
               aria-current="page">
              <span class="bm-nav-icon"
                    aria-hidden="true">☷</span>
              Draaiboek
            </a>

            <a href="financien.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">€</span>
              Financiën
            </a>

            <a href="contactvragen.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">✉</span>
              Contactvragen
            </a>

          </nav>
        </div>

        <div class="bm-sidebar-footer">
          <div class="bm-account">
            <span class="bm-account-avatar"
                  aria-hidden="true">B</span>
            <span>
              <strong>Beheeromgeving</strong>
              <small>Frontenddemo</small>
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
                    aria-expanded="false"
                    aria-label="Open beheermenu">
              <span aria-hidden="true">☰</span>
              Menu
            </button>

            <div class="bm-breadcrumb">
              <span>Beheeromgeving</span>
              <span aria-hidden="true">/</span>
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
                Beheer werkzaamheden, volg de voortgang
                en houd de organisatie overzichtelijk.
              </p>
            </div>

            <button type="button"
                    id="dbpAdd"
                    class="dbp-btn dbp-btn-primary">
              + Taak toevoegen
            </button>
          </section>

          <nav class="dbp-tabs"
               aria-label="Draaiboekweergaven">

            <a href="draaiboek.html"
               ${view === "dag"
                 ? 'class="is-active" aria-current="page"'
                 : ""}>
              Dag
            </a>

            <a href="draaiboek-maand.html"
               ${view === "maand"
                 ? 'class="is-active" aria-current="page"'
                 : ""}>
              Maand
            </a>

            <a href="mijn-taken.html"
               ${view === "mijn"
                 ? 'class="is-active" aria-current="page"'
                 : ""}>
              Mijn taken
            </a>

          </nav>

          <div class="bm-notice" role="note">
            <span class="bm-notice-icon"
                  aria-hidden="true">i</span>

            <div>
              <strong>
                Voorbeeldplanning — alleen lokaal opgeslagen
              </strong>

              <p>
                Het bestaande draaiboek gebruikt juni 2027
                als demokalender. De evenementdatums zijn
                nog niet officieel bevestigd.
                Taken worden uitsluitend in deze browser
                opgeslagen en zijn niet gekoppeld aan
                gebruikersaccounts of de backend.
              </p>
            </div>
          </div>

          <section class="dbp-stats"
                   aria-label="Taakstatistieken">

            <article class="dbp-stat">
              <span>Totaal taken</span>
              <strong id="dbpTotal">0</strong>
              <small id="dbpTotalLabel">
                In dit overzicht
              </small>
            </article>

            <article class="dbp-stat">
              <span>Open of bezig</span>
              <strong id="dbpActive">0</strong>
              <small>Nog niet afgerond</small>
            </article>

            <article class="dbp-stat">
              <span>Afgerond</span>
              <strong id="dbpDone">0</strong>
              <small>Status gereed</small>
            </article>

          </section>

          <section class="dbp-toolbar"
                   aria-label="Filters en acties">

            <div class="dbp-filter-grid">

              <label class="dbp-field"
                     id="dbpDayWrap">
                Wandelavond
                <select id="dbpDayFilter"></select>
              </label>

              <label class="dbp-field dbp-field-search">
                Zoeken
                <input id="dbpSearch"
                       type="search"
                       placeholder="Zoek taak of omschrijving">
              </label>

              <label class="dbp-field">
                Team
                <select id="dbpTeamFilter">
                  <option value="">Alle teams</option>
                </select>
              </label>

              <label class="dbp-field">
                Moment
                <select id="dbpMomentFilter">
                  <option value="">Alle momenten</option>
                </select>
              </label>

              <label class="dbp-field">
                Status
                <select id="dbpStatusFilter">
                  <option value="">Alle statussen</option>
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
                      class="dbp-btn"
                      ${view !== "dag" ? "hidden" : ""}>
                Dupliceer naar volgende avond
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
                <p class="bm-eyebrow">DEMONTH 2027</p>
                <h2>Juni — demokalender</h2>
                <p>
                  Selecteer een dag om de taken te bekijken.
                </p>
              </div>
              <span class="dbp-count">
                30 kalenderdagen
              </span>
            </div>

            <div id="dbpCalendar"
                 class="dbp-calendar"
                 aria-label="Kalender juni 2027">
            </div>

          </section>

          <div id="dbpMainLayout" class="dbp-layout">

            <section class="dbp-panel"
                     aria-labelledby="dbpListTitle">

              <div class="dbp-panel-header">
                <div>
                  <p class="bm-eyebrow">
                    TAKENOVERZICHT
                  </p>

                  <h2 id="dbpListTitle">
                    Taken
                  </h2>

                  <p id="dbpListSubtitle">
                    Werkzaamheden per wandelavond
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

              <div class="dbp-progress-track"
                   aria-hidden="true">
                <span id="dbpProgressFill"></span>
              </div>

              <p id="dbpProgressDescription">
                Taken afgerond in dit overzicht.
              </p>

              <p style="margin-top:20px">
                Bij een noodgeval neem je contact
                op met de evenementcoördinator.
                Bel bij direct gevaar 112.
              </p>

            </aside>

          </div>

          <p id="dbpFeedback"
             class="dbp-feedback"
             role="status"
             aria-live="polite"></p>

          <footer class="bm-content-footer">
            Avond4daagse 2027 · Draaiboek · Frontenddemo
          </footer>

        </main>
      </div>
    </div>

    <dialog id="dbpModal"
            class="dbp-dialog"
            aria-labelledby="dbpModalTitle">

      <div class="dbp-dialog-heading">
        <div>
          <p class="bm-eyebrow">TAAKGEGEVENS</p>
          <h2 id="dbpModalTitle">
            Taak toevoegen
          </h2>
        </div>

        <button type="button"
                class="dbp-close"
                id="dbpCloseModal"
                aria-label="Venster sluiten">
          ×
        </button>
      </div>

      <form id="dbpForm" class="dbp-form">

        <label>
          Taaknaam
          <input id="dbpTaskTitle"
                 type="text"
                 maxlength="100"
                 required
                 placeholder="Bijv. Materialen controleren">
        </label>

        <label>
          Omschrijving
          <textarea id="dbpTaskDescription"
                    rows="3"
                    maxlength="800"
                    placeholder="Wat moet er gebeuren?"></textarea>
        </label>

        <div class="dbp-form-grid">

          <label class="dbp-field">
            Dag of wandelavond
            <select id="dbpTaskDate"></select>
          </label>

          <label class="dbp-field">
            Team
            <select id="dbpTaskTeam"></select>
          </label>

        </div>

        <div class="dbp-form-grid">

          <label class="dbp-field">
            Moment
            <select id="dbpTaskMoment"></select>
          </label>

          <label class="dbp-field">
            Status
            <select id="dbpTaskStatus"></select>
          </label>

        </div>

        <label class="dbp-check-label">
          <input id="dbpTaskPersonal"
                 type="checkbox">
          Tonen onder Mijn taken (voorbeeldgebruiker)
        </label>

        <div class="dbp-form-actions">

          <button type="button"
                  id="dbpCancelModal"
                  class="dbp-btn">
            Annuleren
          </button>

          <button type="submit"
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


  // ========================================
  // 4. SELECTVELDEN OPBOUWEN
  // ========================================

  function addOption(select, value, label) {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;

    select.appendChild(option);
  }

  const dayFilter = $("dbpDayFilter");
  const teamFilter = $("dbpTeamFilter");
  const momentFilter = $("dbpMomentFilter");
  const statusFilter = $("dbpStatusFilter");
  const searchInput = $("dbpSearch");

  const formDate = $("dbpTaskDate");
  const formTeam = $("dbpTaskTeam");
  const formMoment = $("dbpTaskMoment");
  const formStatus = $("dbpTaskStatus");

  TEAMS.forEach(value => {
    addOption(teamFilter, value, value);
    addOption(formTeam, value, value);
  });

  MOMENTS.forEach(value => {
    addOption(momentFilter, value, value);
    addOption(formMoment, value, value);
  });

  STATUSES.forEach(value => {
    addOption(statusFilter, value, value);
    addOption(formStatus, value, value);
  });

  // Dag en Mijn taken werken met vier avonden.
  // Maand toont alle dagen van de demokalender.
  const formDayCount = view === "maand" ? 30 : 4;

  for (let day = 1; day <= formDayCount; day++) {
    const date = dateKey(day);

    addOption(
      formDate,
      date,
      dateLabel(date)
    );
  }

  if (view === "mijn") {
    addOption(dayFilter, "", "Alle avonden");
  }

  if (view === "maand") {
    $("dbpDayWrap").hidden = true;
    $("dbpCalendarPanel").hidden = false;
    $("dbpMainLayout").className =
      "dbp-calendar-layout";
  } else {
    EVENINGS.forEach(date => {
      addOption(dayFilter, date, dateLabel(date));
    });

    dayFilter.value =
      view === "dag" ? DEFAULT_DATE : "";
  }


  // ========================================
  // 5. FILTERS
  // ========================================

  function getScopeItems() {
    const all = allItems();

    if (view === "mijn") {
      return all.filter(isPersonal);
    }

    if (view === "dag") {
      return all.filter(
        item => item.date === selectedDate
      );
    }

    // Maandoverzicht: alle demokalenderdagen.
    return all;
  }

  function getVisibleItems() {
    const query = searchInput.value
      .trim()
      .toLocaleLowerCase("nl-NL");

    return getScopeItems().filter(item => {
      const task = item.task;

      const searchable = [
        task.titel,
        task.omschrijving,
        task.team,
        task.moment
      ].join(" ").toLocaleLowerCase("nl-NL");

      const dateMatch = view === "mijn"
        ? (!dayFilter.value ||
            item.date === dayFilter.value)
        : view === "maand"
          ? item.date === selectedDate
          : true;

      return (
        dateMatch &&
        (!query || searchable.includes(query)) &&
        (!teamFilter.value ||
          task.team === teamFilter.value) &&
        (!momentFilter.value ||
          task.moment === momentFilter.value) &&
        (!statusFilter.value ||
          task.status === statusFilter.value)
      );
    });
  }


  // ========================================
  // 6. STATISTIEKEN
  // ========================================

  function renderStats() {
    const items = getScopeItems();

    const done = items.filter(
      item => item.task.status === "Gereed"
    ).length;

    $("dbpTotal").textContent =
      String(items.length);

    $("dbpActive").textContent =
      String(items.length - done);

    $("dbpDone").textContent =
      String(done);

    $("dbpTotalLabel").textContent =
      view === "dag"
        ? "Taken op deze demoavond"
        : view === "maand"
          ? "Taken in de demomaand"
          : "Persoonlijke voorbeeldtaken";
  }


  // ========================================
  // 7. TAAKSTATUS WIJZIGEN
  // ========================================

  function changeStatus(date, id, newStatus) {
    if (!STATUSES.includes(newStatus)) return;

    updateTasks(next => {
      const task = (next[date] || []).find(
        item => String(item.id) === String(id)
      );

      if (task) {
        task.status = newStatus;
      }
    }, "Taakstatus lokaal bijgewerkt.");
  }


  // ========================================
  // 8. TAAKKAART MAKEN
  // ========================================

  function renderTaskCard(item) {
    const { date, task } = item;

    const card = create(
      "article",
      "dbp-task-card"
    );

    if (task.status === "Gereed") {
      card.classList.add("is-done");
    }

    const head = create("div", "dbp-task-head");
    const info = create("div");

    if (view !== "dag") {
      info.appendChild(
        create(
          "span",
          "dbp-task-date",
          dateLabel(date)
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

    const meta = create("div", "dbp-task-meta");

    [
      task.team,
      task.moment
    ].forEach(value => {
      meta.appendChild(
        create("span", "", value)
      );
    });

    if (isPersonal(item)) {
      meta.appendChild(
        create("span", "", "Mijn taak · demo")
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

    status.setAttribute(
      "aria-label",
      "Status van " + task.titel
    );

    STATUSES.forEach(value => {
      addOption(status, value, value);
    });

    status.value = task.status;

    status.addEventListener("change", () => {
      changeStatus(date, task.id, status.value);
    });

    actions.appendChild(status);

    // Op Dag en Maand kun je ook bewerken
    // en verwijderen. Mijn taken kan status
    // veranderen en blijft verder eenvoudig.
    if (view !== "mijn") {

      const edit = create(
        "button",
        "dbp-btn",
        "Bewerken"
      );

      edit.type = "button";

      edit.addEventListener("click", () => {
        openForm(item);
      });

      actions.appendChild(edit);

      const remove = create(
        "button",
        "dbp-btn dbp-btn-danger",
        "Verwijderen"
      );

      remove.type = "button";

      remove.addEventListener("click", () => {
        removeTask(date, task.id, task.titel);
      });

      actions.appendChild(remove);
    }

    card.appendChild(actions);

    return card;
  }


  // ========================================
  // 9. TAKEN TONEN
  // ========================================

  function renderTaskList() {
    const visible = getVisibleItems();

    const allForSelected = getScopeItems().filter(
      item =>
        view !== "maand" ||
        item.date === selectedDate
    );

    const list = $("dbpTaskList");
    list.replaceChildren();

    if (view === "dag") {
      $("dbpListTitle").textContent =
        dateLabel(selectedDate);
    } else if (view === "maand") {
      $("dbpListTitle").textContent =
        dayNumber(selectedDate) + " juni 2027";
    } else {
      $("dbpListTitle").textContent =
        "Mijn voorbeeldtaken";
    }

    $("dbpListSubtitle").textContent =
      view === "mijn"
        ? "Voorbeeldtaken die aan de demogebruiker zijn gekoppeld."
        : "Selecteer een taak om de status aan te passen.";

    $("dbpListCount").textContent =
      visible.length + " zichtbaar";

    if (visible.length === 0) {
      list.appendChild(
        create(
          "p",
          "dbp-empty",
          "Geen taken gevonden. Pas de filters aan " +
          "of voeg een nieuwe taak toe."
        )
      );
    } else {

      const groups = [...MOMENTS];

      groups.forEach(moment => {
        const groupItems = visible.filter(
          item => item.task.moment === moment
        );

        if (groupItems.length === 0) return;

        list.appendChild(
          create(
            "h3",
            "dbp-group-heading",
            moment
          )
        );

        groupItems.forEach(item => {
          list.appendChild(
            renderTaskCard(item)
          );
        });
      });
    }

    // Voortgang van het huidige overzicht.
    const total = allForSelected.length;

    const done = allForSelected.filter(
      item => item.task.status === "Gereed"
    ).length;

    $("dbpProgressText").textContent =
      done + " / " + total;

    $("dbpProgressFill").style.width =
      (total ? done / total * 100 : 0) + "%";

    $("dbpProgressDescription").textContent =
      total
        ? done + " van " + total +
          " taken zijn afgerond."
        : "Er staan nog geen taken in dit overzicht.";
  }


  // ========================================
  // 10. MAANDKALENDER
  // ========================================

  function renderCalendar() {
    if (view !== "maand") return;

    const calendar = $("dbpCalendar");
    calendar.replaceChildren();

    ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
      .forEach(label => {
        calendar.appendChild(
          create("span", "dbp-weekday", label)
        );
      });

    // 1 juni 2027 valt op dinsdag.
    // Gebruik UTC om tijdzoneverschillen
    // in de kalenderraster te voorkomen.
    const firstDay = new Date(
      Date.UTC(2027, 5, 1)
    ).getUTCDay();

    const offset = (firstDay + 6) % 7;

    for (let i = 0; i < offset; i++) {
      calendar.appendChild(
        create("span", "dbp-calendar-spacer")
      );
    }

    for (let day = 1; day <= 30; day++) {
      const date = dateKey(day);
      const dayTasks = tasks[date] || [];

      const button = create(
        "button",
        "dbp-calendar-day"
      );

      button.type = "button";

      button.classList.toggle(
        "is-selected",
        date === selectedDate
      );

      button.setAttribute(
        "aria-pressed",
        String(date === selectedDate)
      );

      button.setAttribute(
        "aria-label",
        day + " juni, " +
        dayTasks.length + " taken"
      );

      button.appendChild(
        create("strong", "", day)
      );

      button.appendChild(
        create(
          "small",
          "",
          dayTasks.length
            ? dayTasks.length + " taken"
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


  // ========================================
  // 11. TOTALE WEERGAVE
  // ========================================

  function render() {
    renderStats();
    renderCalendar();
    renderTaskList();

    if (view === "dag") {
      dayFilter.value = selectedDate;

      $("dbpDuplicate").disabled =
        selectedDate === EVENINGS[3];
    }
  }


  // ========================================
  // 12. FORMULIER
  // ========================================

  const dialog = $("dbpModal");
  const taskForm = $("dbpForm");

  function openForm(item = null) {
    taskForm.reset();

    editingId = item
      ? {
          date: item.date,
          id: item.task.id
        }
      : null;

    $("dbpModalTitle").textContent =
      item ? "Taak bewerken" : "Taak toevoegen";

    $("dbpTaskTitle").value =
      item?.task.titel || "";

    $("dbpTaskDescription").value =
      item?.task.omschrijving || "";

    formDate.value =
      item?.date ||
      (
        view === "mijn"
          ? DEFAULT_DATE
          : selectedDate
      );

    formTeam.value =
      item?.task.team || TEAMS[0];

    formMoment.value =
      item?.task.moment || MOMENTS[0];

    formStatus.value =
      item?.task.status || "Open";

    $("dbpTaskPersonal").checked = item
      ? isPersonal(item)
      : view === "mijn";

    dialog.showModal();

    $("dbpTaskTitle").focus();
  }

  function closeForm() {
    dialog.close();
    editingId = null;
  }

  $("dbpAdd").addEventListener("click", () => {
    openForm();
  });

  $("dbpCloseModal").addEventListener(
    "click",
    closeForm
  );

  $("dbpCancelModal").addEventListener(
    "click",
    closeForm
  );

  dialog.addEventListener("close", () => {
    editingId = null;
  });


  // ========================================
  // 13. TAAK TOEVOEGEN OF BEWERKEN
  // ========================================

  taskForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!taskForm.reportValidity()) return;

    const date = formDate.value;
    const title = $("dbpTaskTitle").value.trim();

    if (!title) return;

    const newTask = {
      id: editingId?.id ?? makeId(),
      titel: title,
      omschrijving:
        $("dbpTaskDescription").value.trim(),
      team: formTeam.value,
      moment: formMoment.value,
      status: formStatus.value,
      eigen: $("dbpTaskPersonal").checked
    };

    const saved = updateTasks(next => {

      if (!next[date]) {
        next[date] = [];
      }

      if (editingId) {
        next[editingId.date] = (
          next[editingId.date] || []
        ).filter(
          task =>
            String(task.id) !== String(editingId.id)
        );
      }

      next[date].push(newTask);

    }, editingId
      ? "Taak bijgewerkt in de browser."
      : "Nieuwe taak lokaal toegevoegd."
    );

    if (!saved) return;

    // Open het betreffende overzicht.
    if (view !== "mijn") {
      selectedDate = date;
    }

    teamFilter.value = "";
    momentFilter.value = "";
    statusFilter.value = "";
    searchInput.value = "";

    closeForm();
    render();
  });


  // ========================================
  // 14. TAAK VERWIJDEREN
  // ========================================

  function removeTask(date, id, title) {
    const confirmed = window.confirm(
      'Wil je "' + title + '" verwijderen ' +
      "uit dit lokale draaiboek?\n\n" +
      "De database wordt niet gewijzigd."
    );

    if (!confirmed) return;

    updateTasks(next => {
      next[date] = (next[date] || []).filter(
        task => String(task.id) !== String(id)
      );
    }, "Taak lokaal verwijderd.");
  }


  // ========================================
  // 15. DUPLICEREN NAAR VOLGENDE AVOND
  // ========================================

  $("dbpDuplicate").addEventListener("click", () => {
    if (view !== "dag") return;

    const index = EVENINGS.indexOf(selectedDate);
    const nextDate = EVENINGS[index + 1];

    if (!nextDate) {
      showMessage(
        "Er is geen volgende demoavond."
      );
      return;
    }

    const source = tasks[selectedDate] || [];

    if (source.length === 0) {
      showMessage(
        "Deze avond heeft nog geen taken."
      );
      return;
    }

    const confirmed = window.confirm(
      source.length + " taak/taken kopiëren " +
      "naar de volgende demoavond?\n\n" +
      "De nieuwe taken krijgen status Open."
    );

    if (!confirmed) return;

    const saved = updateTasks(next => {
      if (!next[nextDate]) {
        next[nextDate] = [];
      }

      source.forEach(task => {
        next[nextDate].push({
          ...task,
          id: makeId(),
          status: "Open"
        });
      });
    }, source.length +
      " taak/taken naar de volgende avond gekopieerd."
    );

    if (saved) {
      selectedDate = nextDate;
      dayFilter.value = nextDate;
      render();
    }
  });


  // ========================================
  // 16. FILTERS
  // ========================================

  if (view !== "maand") {
    dayFilter.addEventListener("change", () => {
      if (view === "dag") {
        selectedDate = dayFilter.value;
      }

      render();
    });
  }

  [searchInput, teamFilter, momentFilter, statusFilter]
    .forEach(control => {

      control.addEventListener(
        control === searchInput ? "input" : "change",
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

      showMessage("Filters gewist.");
    }
  );


  // ========================================
  // 17. AFDRUKKEN OF PDF OPSLAAN
  // ========================================

  $("dbpPrint").addEventListener("click", () => {
    window.print();
  });


  // ========================================
  // 18. WIJZIGINGEN UIT ANDERE TABBLADEN
  // ========================================

  window.addEventListener("storage", event => {
    if (event.key !== KEY) return;

    tasks = loadTasks();
    render();

    showMessage(
      "Het draaiboek is bijgewerkt vanuit " +
      "een ander browsertabblad."
    );
  });


  // ========================================
  // 19. START
  // ========================================

  render();

});
