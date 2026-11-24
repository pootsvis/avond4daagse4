
// ==========================================
// AVOND4DAAGSE 2027
// FINANCIËN - GEDEELDE FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const app = document.getElementById("bfApp");
  if (!app) return;

  const view = app.dataset.view;
  const KEY = "a4d-financien-demo-v1";

  const $ = id => document.getElementById(id);

  const euro = value => new Intl.NumberFormat(
    "nl-NL",
    { style: "currency", currency: "EUR" }
  ).format(value);

  // Bestaande voorbeeldcijfers uit de repository.
  const BASIS = {
    inkomsten: 9996,
    uitgaven: 6740,
    openstaandeDeelnemers: 612,
    budget: 10700,

    maandInkomsten: [
      300, 550, 900, 1200, 2250, 2100,
      1200, 700, 500, 200, 96, 0
    ],

    maandUitgaven: [
      250, 320, 400, 700, 900, 1100,
      750, 620, 570, 400, 360, 370
    ]
  };

  // De oorspronkelijke transacties zijn voorbeelden
  // en zijn al verwerkt in de basisbedragen.
  const VOORBEELDEN = [
    {
      datum: "2027-04-14",
      omschrijving: "Inschrijving A4D-1248",
      type: "inkomst",
      bedrag: 8.50,
      status: "Ontvangen"
    },
    {
      datum: "2027-04-14",
      omschrijving: "Inschrijving A4D-1246",
      type: "inkomst",
      bedrag: 8.50,
      status: "Ontvangen"
    },
    {
      datum: "2027-04-13",
      omschrijving: "Drukwerk startkaarten",
      type: "uitgave",
      bedrag: 428,
      status: "Betaald"
    },
    {
      datum: "2027-04-12",
      omschrijving: "Inschrijving A4D-1243",
      type: "inkomst",
      bedrag: 8.50,
      status: "Ontvangen"
    },
    {
      datum: "2027-04-11",
      omschrijving: "Huur dranghekken",
      type: "uitgave",
      bedrag: 360,
      status: "Betaald"
    }
  ];

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


  // ========================================
  // 1. OPGESLAGEN BOEKINGEN
  // ========================================

  function leesBoekingen() {
    try {
      const data = JSON.parse(
        localStorage.getItem(KEY) || "[]"
      );

      if (!Array.isArray(data)) return [];

      return data
        .filter(item =>
          item &&
          ["inkomst", "uitgave"].includes(item.type) &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.datum) &&
          Number.isFinite(Number(item.bedrag)) &&
          Number(item.bedrag) > 0
        )
        .map((item, index) => ({
          id: String(item.id ?? ("oud-" + index)),
          datum: item.datum,
          omschrijving: String(
            item.omschrijving || "Boeking"
          ).slice(0, 150),
          type: item.type,
          bedrag: Number(item.bedrag),
          status: String(
            item.status ||
            (item.type === "inkomst"
              ? "Ontvangen"
              : "Nog te betalen")
          ),
          categorie: String(item.categorie || "Overig"),
          rekening: String(item.rekening || ""),
          referentie: String(item.referentie || "")
        }));

    } catch (error) {
      console.warn("Boekingen laden mislukt.", error);
      return [];
    }
  }

  let boekingen = leesBoekingen();

  function opslaan(nieuweBoekingen) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(nieuweBoekingen)
      );

      boekingen = nieuweBoekingen;
      return true;

    } catch (error) {
      console.warn("Boeking opslaan mislukt.", error);
      return false;
    }
  }


  // ========================================
  // 2. GEDEELDE LAYOUT
  // ========================================

  const isOverview = view === "overzicht";
  const pageTitle = isOverview
    ? "Financiën"
    : "Boeking toevoegen";

  function overviewHTML() {
    return `
      <section class="bf-heading">
        <div>
          <p class="bm-eyebrow">FINANCIEEL BEHEER</p>
          <h1>Financiën</h1>
          <p>
            Een overzicht van inkomsten, uitgaven
            en lokaal geregistreerde boekingen.
          </p>
        </div>

        <a href="financien-boeking.html"
           class="bf-button bf-button-primary">
          + Nieuwe boeking
        </a>
      </section>

      <div class="bm-notice" role="note">
        <span class="bm-notice-icon"
              aria-hidden="true">i</span>
        <div>
          <strong>Financiële frontenddemo</strong>
          <p>
            De basisbedragen en voorbeeldtransacties
            zijn fictief. Nieuwe boekingen worden
            alleen in deze browser opgeslagen.
            Er is geen bankkoppeling of echte boekhouding.
            Voorbeeldtransacties zijn al meegenomen
            in de basisbedragen en worden niet dubbel geteld.
          </p>
        </div>
      </div>

      <section class="bf-stats"
               aria-label="Financiële statistieken">

        <article class="bf-stat">
          <span>Ontvangen inkomsten</span>
          <strong id="bfIncome">€ 0</strong>
          <small>Voorbeeldbasis + lokale ontvangsten</small>
        </article>

        <article class="bf-stat">
          <span>Betaalde uitgaven</span>
          <strong id="bfExpenses">€ 0</strong>
          <small>Voorbeeldbasis + lokale betalingen</small>
        </article>

        <article class="bf-stat">
          <span>Nog te betalen uitgaven</span>
          <strong id="bfPending">€ 0</strong>
          <small>Alleen lokaal ingevoerde boekingen</small>
        </article>

        <article class="bf-stat" id="bfResultCard">
          <span>Resultaat</span>
          <strong id="bfResult">€ 0</strong>
          <small>Ontvangen minus betaalde uitgaven</small>
        </article>
      </section>

      <section class="bf-panel"
               aria-labelledby="bfTableTitle">

        <div class="bf-panel-header">
          <div>
            <p class="bm-eyebrow">BOEKHOUDING</p>
            <h2 id="bfTableTitle">Transactieoverzicht</h2>
            <p>
              Bekijk fictieve voorbeeldtransacties
              en je eigen lokaal toegevoegde boekingen.
            </p>
          </div>

          <button type="button"
                  class="bf-button bf-button-primary"
                  id="bfExport">
            Download CSV ↓
          </button>
        </div>

        <div class="bf-filters">
          <label class="bf-field">
            Zoeken
            <input type="search"
                   id="bfSearch"
                   placeholder="Zoek omschrijving of categorie">
          </label>

          <label class="bf-field">
            Type
            <select id="bfTypeFilter">
              <option value="alle">Alle transacties</option>
              <option value="inkomst">Inkomsten</option>
              <option value="uitgave">Uitgaven</option>
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
                <th scope="col">Datum</th>
                <th scope="col">Omschrijving</th>
                <th scope="col">Type</th>
                <th scope="col">Bedrag</th>
                <th scope="col">Status</th>
                <th scope="col">Bron</th>
                <th scope="col">Actie</th>
              </tr>
            </thead>
            <tbody id="bfTableBody"></tbody>
          </table>
        </div>

        <p class="bf-table-footer"
           id="bfCount"
           aria-live="polite"></p>
      </section>

      <section class="bf-panel"
               aria-labelledby="bfChartTitle">

        <div class="bf-panel-header">
          <div>
            <p class="bm-eyebrow">JAAROVERZICHT</p>
            <h2 id="bfChartTitle">
              Inkomsten en uitgaven 2027
            </h2>
            <p>
              Maandelijkse voorbeeldbedragen,
              aangevuld met lokale boekingen uit 2027.
            </p>
          </div>

          <span class="bf-label">Demo · 2027</span>
        </div>

        <div class="bf-chart-legend">
          <span>
            <i class="bf-legend-dot"
               aria-hidden="true"></i>
            Ontvangen inkomsten
          </span>
          <span>
            <i class="bf-legend-dot is-expense"
               aria-hidden="true"></i>
            Betaalde uitgaven
          </span>
        </div>

        <div class="bf-chart-scroll">
          <div id="bfChart"
               class="bf-chart"
               aria-label="Maandgrafiek inkomsten en uitgaven">
          </div>
        </div>

        <p class="bf-help">
          Openstaande deelnemersbetalingen uit de
          oorspronkelijke mock-up: € 612.
          Dit bedrag is niet gekoppeld aan de lokaal
          geregistreerde uitgaven hierboven.
        </p>
      </section>

      <section class="bf-panel">
        <div class="bf-panel-header">
          <div>
            <p class="bm-eyebrow">BEGROTING</p>
            <h2>Budgetinformatie</h2>
            <p>
              Oorspronkelijk fictief budget: € 10.700.
            </p>
          </div>

          <span id="bfBudgetLabel"
                class="bf-label">0% gebruikt</span>
        </div>

        <p class="bf-help">
          De berekening gebruikt betaalde
          voorbeeld- en demo-uitgaven. Het is
          geen werkelijk banksaldo of vastgesteld budget.
        </p>
      </section>

      <p class="bf-feedback"
         id="bfFeedback"
         role="status"
         aria-live="polite"></p>
    `;
  }


  function bookingHTML() {
    return `
      <section class="bf-heading">
        <div>
          <p class="bm-eyebrow">FINANCIEEL BEHEER</p>
          <h1>Boeking toevoegen</h1>
          <p>
            Registreer een inkomstenboeking of uitgave
            voor de financiële frontenddemo.
          </p>
        </div>

        <a href="financien.html"
           class="bf-button">
          ← Financieel overzicht
        </a>
      </section>

      <div class="bm-notice" role="note">
        <span class="bm-notice-icon"
              aria-hidden="true">i</span>
        <div>
          <strong>Alleen een lokale registratie</strong>
          <p>
            Een boeking toevoegen voert geen betaling uit.
            De gegevens worden alleen in deze browser
            opgeslagen en niet naar de backend verzonden.
            Voeg hier geen echte vertrouwelijke
            financiële gegevens toe.
          </p>
        </div>
      </div>

      <div class="bf-form-layout">

        <section class="bf-panel">
          <div class="bf-panel-header">
            <div>
              <p class="bm-eyebrow">NIEUWE REGISTRATIE</p>
              <h2>Boekingsgegevens</h2>
              <p>
                Vul de gegevens in en sla de demo-boeking op.
              </p>
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
                  Ontvangen betaling
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
                       max="999999999"
                       step="0.01"
                       placeholder="180,00"
                       required>
              </label>

            </div>

            <label class="bf-field">
              Omschrijving *
              <input type="text"
                     id="bfDescription"
                     maxlength="150"
                     placeholder="Bijv. Materialen startbureau"
                     required>
            </label>

            <div class="bf-form-grid">

              <label class="bf-field">
                Categorie *
                <select id="bfCategory" required></select>
              </label>

              <label class="bf-field">
                Rekening (demo)
                <select id="bfAccount">
                  <option>Betaalrekening</option>
                  <option>Spaarrekening</option>
                  <option>Kas</option>
                </select>
              </label>

            </div>

            <label class="bf-field">
              Betaalstatus *
              <select id="bfStatus" required></select>
            </label>

            <label class="bf-field"
                   id="bfReferenceWrap"
                   hidden>
              Inschrijfnummer (optioneel)
              <input type="text"
                     id="bfReference"
                     maxlength="60"
                     placeholder="Bijv. A4D-1248">
            </label>

            <div class="bf-form-actions">
              <a href="financien.html"
                 class="bf-button">
                Annuleren
              </a>

              <button type="submit"
                      id="bfSave"
                      class="bf-button bf-button-primary">
                Boeking opslaan
              </button>
            </div>

          </form>

          <p id="bfFeedback"
             class="bf-feedback"
             role="status"
             aria-live="polite"></p>
        </section>

        <aside>
          <div class="bf-info-card">
            <h3>Wat gebeurt er bij opslaan?</h3>
            <p>
              De boeking verschijnt op de pagina
              Financiën. Je kunt hem daar ook weer
              verwijderen. Er wordt geen geld overgemaakt.
            </p>
          </div>

          <div class="bf-info-card">
            <h3>Betaald of nog te betalen?</h3>
            <p>
              Bij uitgaven telt alleen de status
              Betaald mee bij de betaalde uitgaven.
              Nog te betalen verschijnt apart.
            </p>
          </div>

          <div class="bf-info-card">
            <h3>Geen echte bankkoppeling</h3>
            <p>
              De gekozen rekening is slechts
              aanvullende informatie bij de demo-boeking.
              Er worden geen saldi bijgehouden.
            </p>
          </div>
        </aside>

      </div>
    `;
  }


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

            <a href="draaiboek.html">
              <span class="bm-nav-icon"
                    aria-hidden="true">☷</span>
              Draaiboek
            </a>

            <a href="financien.html"
               class="bm-nav-active"
               aria-current="page">
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

          <a href="login.html" class="bm-sidebar-exit">
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
              <strong>${pageTitle}</strong>
            </div>
          </div>

          <a href="../../index.html"
             class="bm-website-link">
            Bekijk publieke website ↗
          </a>
        </header>

        <main class="bm-content">
          ${isOverview ? overviewHTML() : bookingHTML()}

          <footer class="bm-content-footer">
            Avond4daagse 2027 · Financiën · Frontenddemo
          </footer>
        </main>
      </div>
    </div>

    <div class="bm-backdrop"
         id="bmBackdrop"
         hidden></div>
  `;


  // ========================================
  // 3. DOM-HULPFUNCTIES
  // ========================================

  function element(tag, className = "", text) {
    const node = document.createElement(tag);

    if (className) node.className = className;

    if (text !== undefined) {
      node.textContent = String(text);
    }

    return node;
  }

  function cel(text, className = "") {
    return element("td", className, text);
  }

  function meld(text) {
    $("bfFeedback").textContent = text;
  }

  function createId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return "boeking-" + Date.now() + "-" +
      Math.random().toString(36).slice(2);
  }


  // ========================================
  // 4. FINANCIËLE BEREKENINGEN
  // ========================================

  function betaaldeBoeking(item) {
    return (
      (item.type === "inkomst" &&
       item.status === "Ontvangen") ||
      (item.type === "uitgave" &&
       item.status === "Betaald")
    );
  }

  function totalen() {
    let inkomsten = BASIS.inkomsten;
    let uitgaven = BASIS.uitgaven;
    let nogTeBetalen = 0;

    boekingen.forEach(item => {
      if (
        item.type === "inkomst" &&
        item.status === "Ontvangen"
      ) {
        inkomsten += item.bedrag;
      }

      if (item.type === "uitgave") {
        if (item.status === "Betaald") {
          uitgaven += item.bedrag;
        } else if (item.status === "Nog te betalen") {
          nogTeBetalen += item.bedrag;
        }
      }
    });

    return {
      inkomsten,
      uitgaven,
      nogTeBetalen,
      resultaat: inkomsten - uitgaven
    };
  }


  // ========================================
  // 5. TRANSACTIES
  // ========================================

  function alleTransacties() {
    const voorbeelden = VOORBEELDEN.map((item, index) => ({
      ...item,
      id: "voorbeeld-" + index,
      bron: "Voorbeeld",
      categorie: "",
      rekening: ""
    }));

    const lokaal = boekingen.map(item => ({
      ...item,
      bron: "Lokaal"
    }));

    return [...voorbeelden, ...lokaal].sort(
      (a, b) => b.datum.localeCompare(a.datum)
    );
  }

  function zichtbareTransacties() {
    const query = $("bfSearch").value
      .trim()
      .toLocaleLowerCase("nl-NL");

    const type = $("bfTypeFilter").value;

    return alleTransacties().filter(item => {
      const text = [
        item.omschrijving,
        item.categorie,
        item.referentie || ""
      ].join(" ").toLocaleLowerCase("nl-NL");

      return (
        (!query || text.includes(query)) &&
        (type === "alle" || item.type === type)
      );
    });
  }


  // ========================================
  // 6. TRANSACTIETABEL
  // ========================================

  function renderTabel() {
    const body = $("bfTableBody");
    const rows = zichtbareTransacties();

    body.replaceChildren();

    if (!rows.length) {
      const tr = element("tr");
      const td = cel(
        "Geen transacties gevonden. Pas de filters aan.",
        "bf-empty"
      );

      td.colSpan = 7;
      tr.appendChild(td);
      body.appendChild(tr);

    } else {
      rows.forEach(item => {
        const tr = element("tr");

        tr.appendChild(
          cel(new Date(item.datum + "T12:00:00")
            .toLocaleDateString("nl-NL"))
        );

        tr.appendChild(
          cel(item.omschrijving, "bf-description")
        );

        tr.appendChild(
          cel(item.type === "inkomst"
            ? "Inkomst"
            : "Uitgave")
        );

        tr.appendChild(
          cel(
            (item.type === "inkomst" ? "+ " : "− ") +
            euro(item.bedrag),
            item.type === "inkomst"
              ? "bf-income"
              : "bf-expense"
          )
        );

        const statusTd = element("td");
        const status = element(
          "span",
          item.status === "Nog te betalen"
            ? "bf-status bf-status-pending"
            : "bf-status",
          item.status
        );

        statusTd.appendChild(status);
        tr.appendChild(statusTd);

        const sourceTd = element("td");
        sourceTd.appendChild(
          element(
            "span",
            item.bron === "Lokaal"
              ? "bf-source bf-source-local"
              : "bf-source",
            item.bron
          )
        );
        tr.appendChild(sourceTd);

        const actionsTd = element("td");
        const actions = element(
          "div",
          "bf-row-actions"
        );

        if (item.bron === "Lokaal") {
          if (
            item.type === "uitgave" &&
            item.status === "Nog te betalen"
          ) {
            const paid = element(
              "button",
              "bf-button bf-button-small",
              "Markeer betaald"
            );

            paid.type = "button";
            paid.dataset.action = "paid";
            paid.dataset.id = item.id;
            actions.appendChild(paid);
          }

          const remove = element(
            "button",
            "bf-button bf-button-small bf-button-danger",
            "Verwijder"
          );

          remove.type = "button";
          remove.dataset.action = "remove";
          remove.dataset.id = item.id;

          actions.appendChild(remove);

        } else {
          actions.appendChild(
            element("span", "bf-source", "Vast voorbeeld")
          );
        }

        actionsTd.appendChild(actions);
        tr.appendChild(actionsTd);
        body.appendChild(tr);
      });
    }

    $("bfCount").textContent =
      rows.length + " van " +
      alleTransacties().length +
      " transacties zichtbaar · allemaal demogegevens";

    $("bfExport").disabled = rows.length === 0;
  }


  // ========================================
  // 7. JAARGRAFIEK
  // ========================================

  function renderGrafiek() {
    const inkomsten = [...BASIS.maandInkomsten];
    const uitgaven = [...BASIS.maandUitgaven];

    boekingen.forEach(item => {
      if (
        !item.datum.startsWith("2027-") ||
        !betaaldeBoeking(item)
      ) return;

      const month = Number(
        item.datum.slice(5, 7)
      ) - 1;

      if (month < 0 || month > 11) return;

      if (item.type === "inkomst") {
        inkomsten[month] += item.bedrag;
      } else {
        uitgaven[month] += item.bedrag;
      }
    });

    const months = [
      "jan", "feb", "mrt", "apr", "mei", "jun",
      "jul", "aug", "sep", "okt", "nov", "dec"
    ];

    const maximum = Math.max(
      1,
      ...inkomsten,
      ...uitgaven
    );

    const chart = $("bfChart");
    chart.replaceChildren();

    months.forEach((month, index) => {
      const group = element("div", "bf-chart-item");
      const bars = element("div", "bf-chart-bars");

      const incomeBar = element(
        "div",
        "bf-chart-bar bf-chart-income"
      );

      incomeBar.style.height =
        (inkomsten[index] / maximum * 100) + "%";

      incomeBar.title =
        month + ": inkomsten " + euro(inkomsten[index]);

      const expenseBar = element(
        "div",
        "bf-chart-bar bf-chart-expense"
      );

      expenseBar.style.height =
        (uitgaven[index] / maximum * 100) + "%";

      expenseBar.title =
        month + ": uitgaven " + euro(uitgaven[index]);

      group.setAttribute(
        "aria-label",
        month + ": inkomsten " +
        euro(inkomsten[index]) +
        ", uitgaven " + euro(uitgaven[index])
      );

      bars.append(incomeBar, expenseBar);
      group.append(bars, element("span", "", month));
      chart.appendChild(group);
    });
  }


  // ========================================
  // 8. STATISTIEKEN BIJWERKEN
  // ========================================

  function renderStatistieken() {
    const sums = totalen();

    $("bfIncome").textContent = euro(sums.inkomsten);
    $("bfExpenses").textContent = euro(sums.uitgaven);
    $("bfPending").textContent = euro(sums.nogTeBetalen);
    $("bfResult").textContent = euro(sums.resultaat);

    $("bfResultCard").classList.toggle(
      "is-negative",
      sums.resultaat < 0
    );

    $("bfResultCard").classList.toggle(
      "is-positive",
      sums.resultaat >= 0
    );

    const percent = Math.round(
      sums.uitgaven / BASIS.budget * 100
    );

    $("bfBudgetLabel").textContent =
      percent + "% van fictief budget gebruikt";
  }

  function renderOverview() {
    renderStatistieken();
    renderTabel();
    renderGrafiek();
  }


  // ========================================
  // 9. CSV EXPORT
  // ========================================

  function csvCell(value) {
    let text = String(value ?? "");

    // Voorkom dat CSV-inhoud als formule
    // wordt uitgevoerd in Excel.
    if (/^\s*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportCSV() {
    const rows = zichtbareTransacties();

    if (!rows.length) return;

    const headings = [
      "Datum",
      "Omschrijving",
      "Type",
      "Bedrag",
      "Status",
      "Categorie",
      "Rekening",
      "Bron"
    ];

    const data = rows.map(item => [
      item.datum,
      item.omschrijving,
      item.type,
      item.bedrag.toFixed(2),
      item.status,
      item.categorie || "",
      item.rekening || "",
      item.bron
    ]);

    const content = [
      headings.map(csvCell).join(";"),
      ...data.map(row =>
        row.map(csvCell).join(";")
      )
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + content],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "avond4daagse-financien-demo.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    meld(rows.length + " demotransacties geëxporteerd.");
  }


  // ========================================
  // 10. ACTIES IN HET OVERZICHT
  // ========================================

  function initOverview() {
    $("bfSearch").addEventListener(
      "input",
      renderTabel
    );

    $("bfTypeFilter").addEventListener(
      "change",
      renderTabel
    );

    $("bfClear").addEventListener("click", () => {
      $("bfSearch").value = "";
      $("bfTypeFilter").value = "alle";
      renderTabel();
      meld("Filters gewist.");
    });

    $("bfExport").addEventListener(
      "click",
      exportCSV
    );

    $("bfTableBody").addEventListener("click", event => {
      const button = event.target.closest(
        "button[data-action]"
      );

      if (!button) return;

      const index = boekingen.findIndex(
        item => item.id === button.dataset.id
      );

      if (index === -1) return;

      const item = boekingen[index];

      if (button.dataset.action === "paid") {
        const confirmed = window.confirm(
          'Boeking "' + item.omschrijving +
          '" markeren als betaald in de demo?\n\n' +
          "Dit voert geen betaling uit."
        );

        if (!confirmed) return;

        const next = boekingen.map((entry, i) =>
          i === index
            ? { ...entry, status: "Betaald" }
            : entry
        );

        if (opslaan(next)) {
          renderOverview();
          meld("Boeking lokaal gemarkeerd als betaald.");
        } else {
          meld("Lokaal opslaan is mislukt.");
        }
      }

      if (button.dataset.action === "remove") {
        const confirmed = window.confirm(
          'Wil je "' + item.omschrijving +
          '" uit deze lokale demo verwijderen?'
        );

        if (!confirmed) return;

        const next = boekingen.filter(
          (_, i) => i !== index
        );

        if (opslaan(next)) {
          renderOverview();
          meld("Demo-boeking verwijderd.");
        } else {
          meld("Verwijderen is niet opgeslagen.");
        }
      }
    });

    renderOverview();
  }


  // ========================================
  // 11. BOEKINGSFORMULIER
  // ========================================

  function selectedType() {
    return document.querySelector(
      'input[name="bfType"]:checked'
    ).value;
  }

  function addOption(select, value) {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  }

  function updateFormType() {
    const type = selectedType();

    const categories = $("bfCategory");
    const statuses = $("bfStatus");

    categories.replaceChildren();
    statuses.replaceChildren();

    CATEGORIEEN[type].forEach(value => {
      addOption(categories, value);
    });

    const allowedStatuses = type === "uitgave"
      ? ["Nog te betalen", "Betaald"]
      : ["Ontvangen"];

    allowedStatuses.forEach(value => {
      addOption(statuses, value);
    });

    $("bfReferenceWrap").hidden = type !== "inkomst";
  }

  function initBookingForm() {
    document.querySelectorAll(
      'input[name="bfType"]'
    ).forEach(input => {
      input.addEventListener("change", updateFormType);
    });

    updateFormType();

    $("bfForm").addEventListener("submit", event => {
      event.preventDefault();

      const form = $("bfForm");

      if (!form.reportValidity()) return;

      const amount = Number($("bfAmount").value);
      const date = $("bfDate").value;
      const description = $("bfDescription").value.trim();
      const type = selectedType();

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 999999999 ||
        Math.abs(amount * 100 -
          Math.round(amount * 100)) > 0.00001
      ) {
        meld("Vul een geldig bedrag met maximaal twee decimalen in.");
        return;
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !description
      ) {
        meld("Vul een geldige datum en omschrijving in.");
        return;
      }

      const booking = {
        id: createId(),
        datum: date,
        omschrijving: description,
        type,
        bedrag: Math.round(amount * 100) / 100,
        categorie: $("bfCategory").value,
        rekening: $("bfAccount").value,
        status: $("bfStatus").value,
        referentie: type === "inkomst"
          ? $("bfReference").value.trim()
          : ""
      };

      const next = [...boekingen, booking];

      if (opslaan(next)) {
        window.location.href = "financien.html";
      } else {
        meld(
          "Boeking kon niet lokaal worden opgeslagen. " +
          "Controleer je browseropslag."
        );
      }
    });
  }


  // ========================================
  // 12. START
  // ========================================

  if (isOverview) {
    initOverview();
  } else if (view === "boeking") {
    initBookingForm();
  }

});
