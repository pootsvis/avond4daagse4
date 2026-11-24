
// ==========================================
// AVOND4DAAGSE 2027
// VRIJWILLIGERS & INZET
// GEDEELDE FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  // ========================================
  // VOORBEELDVRIJWILLIGERS UIT DE REPOSITORY
  // ========================================

  const vrijwilligers = [
    {
      id: "V-073",
      naam: "Anja Mulder",
      telefoon: "06 3456 7812",
      rol: "Verkeersregelaar",
      beschikbaar: "4 avonden",
      status: "Bevestigd",
      inzet: "di 18:15–20:30"
    },
    {
      id: "V-072",
      naam: "Peter Kuiper",
      telefoon: "06 2201 9034",
      rol: "Controlepost",
      beschikbaar: "di, wo, vr",
      status: "Bevestigd",
      inzet: "wo 18:15–20:30"
    },
    {
      id: "V-071",
      naam: "Fatima El Amrani",
      telefoon: "06 5512 4800",
      rol: "Startbureau",
      beschikbaar: "4 avonden",
      status: "Uitgenodigd",
      inzet: "di 18:00–19:00"
    },
    {
      id: "V-070",
      naam: "Jan de Groot",
      telefoon: "06 9098 1122",
      rol: "Routebegeleider",
      beschikbaar: "do, vr",
      status: "Bevestigd",
      inzet: "Nog niet ingepland"
    },
    {
      id: "V-069",
      naam: "Iris Hendriks",
      telefoon: "06 1188 4402",
      rol: "EHBO",
      beschikbaar: "4 avonden",
      status: "Bevestigd",
      inzet: "vr 19:30–21:30"
    },
    {
      id: "V-068",
      naam: "Wim Bos",
      telefoon: "06 7070 3301",
      rol: "Finishteam",
      beschikbaar: "vrijdag",
      status: "Uitgenodigd",
      inzet: "vr 19:30–21:30"
    }
  ];


  // ========================================
  // HULPFUNCTIES
  // ========================================

  function makeCell(value, className = "") {

    const td = document.createElement("td");
    td.textContent = String(value);

    if (className) {
      td.className = className;
    }

    return td;
  }


  function csvValue(value) {

    let text = String(value ?? "");

    // Spreadsheet-formules uit CSV-inhoud weren.
    if (/^\s*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
  }


  function downloadCsv(filename, headings, rows) {

    const content = [
      headings.map(csvValue).join(";"),
      ...rows.map(row =>
        row.map(csvValue).join(";")
      )
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + content],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }


  // ========================================
  // DEEL A: VRIJWILLIGERSOVERZICHT
  // ========================================

  if ($("bvTableBody")) {

    const search = $("bvSearch");
    const role = $("bvRole");
    const status = $("bvStatus");
    const form = $("bvFilters");
    const body = $("bvTableBody");
    const resultCount = $("bvResultCount");
    const exportButton = $("bvExport");
    const feedback = $("bvFeedback");

    const dialog = $("bvDialog");

    let visibleVolunteers = [];


    // STATISTIEKEN
    $("bvTotal").textContent =
      String(vrijwilligers.length);

    $("bvConfirmed").textContent = String(
      vrijwilligers.filter(
        item => item.status === "Bevestigd"
      ).length
    );

    $("bvInvited").textContent = String(
      vrijwilligers.filter(
        item => item.status === "Uitgenodigd"
      ).length
    );


    // FILTEREN
    function filterVolunteers() {

      const query = search.value
        .trim()
        .toLocaleLowerCase("nl-NL");

      return vrijwilligers.filter(person => {

        const text = [
          person.id,
          person.naam,
          person.rol,
          person.telefoon
        ].join(" ").toLocaleLowerCase("nl-NL");

        return (
          (query === "" || text.includes(query)) &&
          (role.value === "" || person.rol === role.value) &&
          (status.value === "" ||
            person.status === status.value)
        );
      });
    }


    // DETAILS TONEN
    function showVolunteer(person) {

      $("bvDetailId").textContent = person.id;
      $("bvDetailName").textContent = person.naam;
      $("bvDetailPhone").textContent = person.telefoon;
      $("bvDetailRole").textContent = person.rol;

      $("bvDetailAvailable").textContent =
        person.beschikbaar;

      $("bvDetailStatus").textContent =
        person.status;

      $("bvDetailShift").textContent =
        person.inzet;

      dialog.showModal();
    }


    // RIJ MAKEN
    function createVolunteerRow(person) {

      const tr = document.createElement("tr");

      tr.appendChild(
        makeCell(person.id, "bv-code")
      );

      tr.appendChild(
        makeCell(person.naam, "bv-name")
      );

      tr.appendChild(
        makeCell(person.rol)
      );

      tr.appendChild(
        makeCell(person.beschikbaar)
      );

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");

      badge.className = person.status === "Bevestigd"
        ? "bv-badge bv-badge-confirmed"
        : "bv-badge bv-badge-invited";

      badge.textContent = person.status;

      statusCell.appendChild(badge);
      tr.appendChild(statusCell);

      tr.appendChild(
        makeCell(person.inzet)
      );

      const actionCell = document.createElement("td");
      const button = document.createElement("button");

      button.type = "button";
      button.className = "bv-detail-button";
      button.textContent = "Bekijk";

      button.setAttribute(
        "aria-label",
        "Bekijk gegevens van " + person.naam
      );

      button.addEventListener("click", () => {
        showVolunteer(person);
      });

      actionCell.appendChild(button);
      tr.appendChild(actionCell);

      return tr;
    }


    // TABEL BIJWERKEN
    function renderVolunteers() {

      visibleVolunteers = filterVolunteers();

      body.replaceChildren();

      if (visibleVolunteers.length === 0) {

        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 7;
        td.className = "bv-empty-row";

        td.textContent =
          "Geen vrijwilligers gevonden. " +
          "Pas je zoekopdracht of filters aan.";

        tr.appendChild(td);
        body.appendChild(tr);

      } else {

        visibleVolunteers.forEach(person => {
          body.appendChild(
            createVolunteerRow(person)
          );
        });
      }

      resultCount.textContent =
        visibleVolunteers.length +
        " van " + vrijwilligers.length +
        " voorbeeldvrijwilligers getoond";

      exportButton.disabled =
        visibleVolunteers.length === 0;
    }


    search.addEventListener(
      "input",
      renderVolunteers
    );

    role.addEventListener(
      "change",
      renderVolunteers
    );

    status.addEventListener(
      "change",
      renderVolunteers
    );

    form.addEventListener("submit", event => {
      event.preventDefault();
    });

    form.addEventListener("reset", () => {
      setTimeout(renderVolunteers, 0);
    });


    // CSV EXPORT
    exportButton.addEventListener("click", () => {

      if (visibleVolunteers.length === 0) {
        return;
      }

      const rows = visibleVolunteers.map(person => [
        person.id,
        person.naam,
        person.telefoon,
        person.rol,
        person.beschikbaar,
        person.status,
        person.inzet
      ]);

      downloadCsv(
        "avond4daagse-vrijwilligers-demo.csv",
        [
          "Nummer",
          "Naam",
          "Telefoon",
          "Voorkeursrol",
          "Beschikbaarheid",
          "Status",
          "Voorbeeldinzet"
        ],
        rows
      );

      feedback.textContent =
        visibleVolunteers.length +
        " voorbeeldvrijwilliger(s) geëxporteerd.";
    });


    // DETAILVENSTER SLUITEN
    $("bvCloseDialog").addEventListener(
      "click",
      () => dialog.close()
    );

    $("bvCloseBottom").addEventListener(
      "click",
      () => dialog.close()
    );

    renderVolunteers();
  }


  // ========================================
  // DEEL B: INZETSCHEMA
  // ========================================

  if ($("bsTableBody")) {

    const STORAGE_KEY = "a4d-inzet-demo-v2";

    const times = [
      "17:00–18:00",
      "18:00–19:00",
      "18:15–20:30",
      "19:30–21:30",
      "21:00–22:00"
    ];

    // Zelfde voorbeeldplanning als de
    // oorspronkelijke inzetschema.html.
    //
    // Elke rij bevat vier diensten:
    // [naam, standaard bezet, capaciteit].

    const example = [
      [
        ["Opbouw startterrein", 6, 6],
        ["Opbouw startterrein", 5, 6],
        ["Opbouw startterrein", 4, 6],
        ["Finish opbouw", 8, 10]
      ],
      [
        ["Startbureau", 5, 5],
        ["Startbureau", 4, 5],
        ["Startbureau", 5, 5],
        ["Startbureau", 5, 5]
      ],
      [
        ["Routeposten", 12, 14],
        ["Routeposten", 10, 14],
        ["Routeposten", 13, 14],
        ["Routeposten", 14, 14]
      ],
      [
        ["Finishteam", 6, 6],
        ["Finishteam", 5, 6],
        ["Finishteam", 6, 6],
        ["Medaille-uitgifte", 12, 15]
      ],
      [
        ["Afbouw", 4, 4],
        ["Afbouw", 3, 4],
        ["Afbouw", 4, 4],
        ["Eindschoonmaak", 6, 8]
      ]
    ];

    const allowedNames = [
      "Anja Mulder",
      "Peter Kuiper",
      "Jan de Groot",
      "Iris Hendriks"
    ];

    // Diensten opbouwen.
    const shifts = [];

    example.forEach((row, rowIndex) => {

      row.forEach((data, dayIndex) => {

        shifts.push({
          key: rowIndex + "-" + (dayIndex + 1),
          time: times[rowIndex],
          evening: dayIndex + 1,
          name: data[0],
          baseOccupied: data[1],
          capacity: data[2]
        });

      });
    });


    const tbody = $("bsTableBody");
    const dayFilter = $("bsEveningFilter");
    const onlyOpen = $("bsOnlyOpen");

    const volunteerSelect = $("bsVolunteer");
    const addButton = $("bsAddVolunteer");
    const message = $("bsMessage");

    let selectedKey = "2-3";
    let assignments = loadAssignments();


    // ====================================
    // LOKALE TOEWIJZINGEN
    // ====================================

    function loadAssignments() {

      try {

        const raw = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "{}"
        );

        if (
          !raw ||
          typeof raw !== "object" ||
          Array.isArray(raw)
        ) {
          return {};
        }

        const clean = {};

        shifts.forEach(shift => {

          const names = Array.isArray(raw[shift.key])
            ? raw[shift.key]
            : [];

          const availableSpace =
            shift.capacity - shift.baseOccupied;

          clean[shift.key] = [
            ...new Set(
              names.filter(
                name => allowedNames.includes(name)
              )
            )
          ].slice(0, availableSpace);
        });

        return clean;

      } catch (error) {

        console.warn(
          "Lokale demo-inzet kon niet geladen worden.",
          error
        );

        return {};
      }
    }


    function saveAssignments() {

      try {

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(assignments)
        );

        return true;

      } catch (error) {

        console.warn(
          "Lokale inzet kon niet opgeslagen worden.",
          error
        );

        return false;
      }
    }


    function getAdded(shift) {

      return assignments[shift.key] || [];
    }


    function getOccupied(shift) {

      return shift.baseOccupied +
        getAdded(shift).length;
    }


    function getOpen(shift) {

      return Math.max(
        0,
        shift.capacity - getOccupied(shift)
      );
    }


    function getSelectedShift() {

      return shifts.find(
        shift => shift.key === selectedKey
      ) || null;
    }


    // ====================================
    // STATISTIEKEN
    // ====================================

    function updateShiftStatistics() {

      $("bsTotalShifts").textContent =
        String(shifts.length);

      $("bsOpenPlaces").textContent =
        String(
          shifts.reduce(
            (total, shift) => total + getOpen(shift),
            0
          )
        );

      $("bsFullShifts").textContent =
        String(
          shifts.filter(
            shift => getOpen(shift) === 0
          ).length
        );
    }


    // ====================================
    // ROOSTER OPBOUWEN
    // ====================================

    function renderSchedule() {

      tbody.replaceChildren();

      times.forEach((time, rowIndex) => {

        const tr = document.createElement("tr");

        const timeCell = document.createElement("th");

        timeCell.scope = "row";
        timeCell.textContent = time;

        tr.appendChild(timeCell);


        for (let evening = 1; evening <= 4; evening++) {

          const key = rowIndex + "-" + evening;
          const shift = shifts.find(item =>
            item.key === key
          );

          const td = document.createElement("td");

          td.dataset.evening = String(evening);

          td.hidden = (
            dayFilter.value !== "all" &&
            dayFilter.value !== String(evening)
          );

          const open = getOpen(shift);

          const button = document.createElement("button");

          button.type = "button";
          button.className = "bv-shift-button";
          button.dataset.key = key;

          button.classList.toggle(
            "is-full",
            open === 0
          );

          button.classList.toggle(
            "is-selected",
            selectedKey === key
          );

          button.setAttribute(
            "aria-pressed",
            String(selectedKey === key)
          );

          button.setAttribute(
            "aria-label",
            "Avond " + evening + ", " +
            shift.name + ", " + time + ", " +
            open + " open plaatsen"
          );

          const title = document.createElement("strong");
          title.textContent = shift.name;

          const count = document.createElement("span");

          count.textContent =
            getOccupied(shift) + " / " + shift.capacity +
            " bezet · " +
            (open > 0 ? open + " open" : "vol");

          button.append(title, count);

          button.hidden = onlyOpen.checked && open === 0;

          button.addEventListener("click", () => {
            selectedKey = key;
            message.textContent = "";
            volunteerSelect.value = "";
            renderSchedule();
          });

          const fullPlaceholder = document.createElement(
            "span"
          );

          fullPlaceholder.className = "bv-closed-label";
          fullPlaceholder.textContent = "Vol";

          fullPlaceholder.hidden = !(
            onlyOpen.checked && open === 0
          );

          td.append(button, fullPlaceholder);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      });


      // De kolomkoppen volgen het avondfilter.
      document.querySelectorAll(
        "#bsTable thead th[data-evening]"
      ).forEach(th => {

        th.hidden = (
          dayFilter.value !== "all" &&
          th.dataset.evening !== dayFilter.value
        );
      });


      // Als de huidige selectie onzichtbaar is,
      // selecteer de eerste zichtbare dienst.
      const visibleButtons = [
        ...tbody.querySelectorAll(".bv-shift-button")
      ].filter(button => {

        return (
          !button.hidden &&
          !button.closest("td").hidden
        );
      });

      if (
        !visibleButtons.some(
          button => button.dataset.key === selectedKey
        )
      ) {

        selectedKey = visibleButtons.length
          ? visibleButtons[0].dataset.key
          : null;

        tbody.querySelectorAll(
          ".bv-shift-button"
        ).forEach(button => {

          const active = button.dataset.key === selectedKey;

          button.classList.toggle(
            "is-selected",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(active)
          );
        });
      }

      updateShiftStatistics();
      renderDetails();
    }


    // ====================================
    // DIENSTDETAILS
    // ====================================

    function renderDetails() {

      const shift = getSelectedShift();

      const list = $("bsAssignedNames");
      list.replaceChildren();

      if (!shift) {

        $("bsDetailTitle").textContent =
          "Geen dienst geselecteerd";

        $("bsDetailCount").textContent =
          "Pas het filter aan om een dienst te bekijken.";

        $("bsDetailStatus").textContent =
          "Geen selectie";

        $("bsBaseInfo").textContent =
          "Er is geen dienst geselecteerd.";

        addButton.disabled = true;
        return;
      }

      const open = getOpen(shift);
      const occupied = getOccupied(shift);

      $("bsDetailTitle").textContent =
        shift.name + " · Avond " + shift.evening;

      $("bsDetailCount").textContent =
        shift.time + " · " +
        occupied + " van " + shift.capacity +
        " plaatsen bezet";

      $("bsDetailStatus").textContent =
        open > 0
          ? open + " plaats(en) open"
          : "Volledig bezet";

      $("bsDetailStatus").classList.toggle(
        "is-full",
        open === 0
      );

      $("bsBaseInfo").textContent =
        shift.baseOccupied +
        " plaatsen waren al bezet in de mock-up. " +
        getAdded(shift).length +
        " vrijwilliger(s) zijn via deze demo toegevoegd.";


      const added = getAdded(shift);

      if (added.length === 0) {

        const li = document.createElement("li");

        li.textContent =
          "Nog niemand toegevoegd via dit scherm.";

        list.appendChild(li);

      } else {

        added.forEach(name => {

          const li = document.createElement("li");
          li.textContent = name;

          list.appendChild(li);
        });
      }

      addButton.disabled = open === 0;
    }


    // ====================================
    // VRIJWILLIGER TOEWIJZEN
    // ====================================

    addButton.addEventListener("click", () => {

      const shift = getSelectedShift();

      if (!shift) {
        message.textContent =
          "Selecteer eerst een dienst.";
        return;
      }

      const name = volunteerSelect.value;

      if (!allowedNames.includes(name)) {
        message.textContent =
          "Selecteer eerst een vrijwilliger.";
        return;
      }

      if (getOpen(shift) === 0) {
        message.textContent =
          "Deze dienst is al volledig bezet.";
        return;
      }

      const added = getAdded(shift);

      if (added.includes(name)) {
        message.textContent =
          name + " is al aan deze dienst toegevoegd.";
        return;
      }

      assignments[shift.key] = [
        ...added,
        name
      ];

      const saved = saveAssignments();

      volunteerSelect.value = "";
      renderSchedule();

      message.textContent = saved
        ? name + " is lokaal toegevoegd aan " +
          shift.name + " op Avond " + shift.evening + "."
        : "De toewijzing staat op het scherm, " +
          "maar opslaan in deze browser is mislukt.";
    });


    // ====================================
    // FILTERS
    // ====================================

    dayFilter.addEventListener(
      "change",
      renderSchedule
    );

    onlyOpen.addEventListener(
      "change",
      renderSchedule
    );


    // ====================================
    // TOEWIJZINGEN RESETTEN
    // ====================================

    $("bsReset").addEventListener("click", () => {

      const confirmed = window.confirm(
        "Wil je alle zelf toegevoegde " +
        "demo-toewijzingen verwijderen?\n\n" +
        "De oorspronkelijke voorbeeldplanning " +
        "blijft bestaan."
      );

      if (!confirmed) {
        return;
      }

      assignments = {};

      const saved = saveAssignments();

      renderSchedule();

      message.textContent = saved
        ? "Alle zelf toegevoegde demo-toewijzingen " +
          "zijn gewist."
        : "De toewijzingen zijn op het scherm gewist, " +
          "maar lokaal opslaan is mislukt.";
    });


    // ====================================
    // START
    // ====================================

    renderSchedule();
  }

});
