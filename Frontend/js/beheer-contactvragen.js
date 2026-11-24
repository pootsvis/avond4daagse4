
// ==========================================
// AVOND4DAAGSE 2027
// CONTACTVRAGEN - FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const STORAGE_KEY = "a4d-contactvragen-demo-v1";

  const STATUSES = [
    "Open",
    "In behandeling",
    "Beantwoord"
  ];


  // ========================================
  // 1. BESTAANDE VOORBEELDBERICHTEN
  // ========================================

  const EXAMPLES = [
    {
      id: "voorbeeld-1",
      naam: "Marieka van Leeuwen",
      email: "marieka@example.nl",
      onderwerp: "Vraag over inschrijving",
      bericht:
        "Beste organisatie,\n\n" +
        "Kan ik de afstand van mijn zoon nog aanpassen " +
        "van 10 km naar 5 km? Zijn inschrijfnummer " +
        "is A4D-0982.\n\n" +
        "Alvast bedankt!",
      datum: "2027-06-12",
      tijd: "10:24",
      status: "Open",
      lokaal: false
    },
    {
      id: "voorbeeld-2",
      naam: "Jan Jansen",
      email: "jan.jansen@example.nl",
      onderwerp: "Probleem met betaling",
      bericht:
        "Ik heb betaald, maar mijn inschrijving " +
        "staat nog niet op bevestigd.",
      datum: "2027-06-10",
      tijd: "14:35",
      status: "Beantwoord",
      lokaal: false
    }
  ];


  // ========================================
  // 2. LOKALE OPSLAG
  // ========================================

  function initialState() {
    return {
      berichten: EXAMPLES.map(item => ({ ...item })),
      concepten: {}
    };
  }


  function loadState() {

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return initialState();
      }

      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        !Array.isArray(parsed.berichten)
      ) {
        return initialState();
      }

      const berichten = parsed.berichten
        .filter(item =>
          item &&
          typeof item.id === "string" &&
          typeof item.naam === "string" &&
          typeof item.email === "string" &&
          typeof item.onderwerp === "string" &&
          typeof item.bericht === "string"
        )
        .map(item => ({
          id: item.id,
          naam: item.naam.slice(0, 100),
          email: item.email.slice(0, 150),
          onderwerp: item.onderwerp.slice(0, 150),
          bericht: item.bericht.slice(0, 3000),
          datum: typeof item.datum === "string"
            ? item.datum
            : "",
          tijd: typeof item.tijd === "string"
            ? item.tijd
            : "",
          status: STATUSES.includes(item.status)
            ? item.status
            : "Open",
          lokaal: item.lokaal === true
        }));

      const concepten = {};

      if (
        parsed.concepten &&
        typeof parsed.concepten === "object"
      ) {
        Object.entries(parsed.concepten)
          .forEach(([id, value]) => {

            if (typeof value === "string") {
              concepten[id] = value.slice(0, 3000);
            }
          });
      }

      return { berichten, concepten };

    } catch (error) {

      console.warn(
        "Contactvragen konden niet worden geladen.",
        error
      );

      return initialState();
    }
  }


  let state = loadState();

  let selectedId =
    state.berichten[0]?.id || null;


  function saveState() {

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

      return true;

    } catch (error) {

      console.warn(
        "Contactvragen opslaan mislukt.",
        error
      );

      return false;
    }
  }


  // ========================================
  // 3. HULPFUNCTIES
  // ========================================

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


  function createId() {

    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return (
      "bericht-" +
      Date.now() + "-" +
      Math.random().toString(36).slice(2)
    );
  }


  function currentDate() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  function currentTime() {

    return new Date().toLocaleTimeString(
      "nl-NL",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }


  function formatDate(date) {

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return "Datum onbekend";
    }

    return new Date(
      date + "T12:00:00"
    ).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }


  function badgeClass(status) {

    if (status === "Beantwoord") {
      return "cv-badge is-answered";
    }

    if (status === "In behandeling") {
      return "cv-badge is-progress";
    }

    return "cv-badge";
  }


  function messageById(id) {

    return state.berichten.find(
      item => item.id === id
    ) || null;
  }


  function selectedMessage() {
    return messageById(selectedId);
  }


  function notify(text) {
    $("cvFeedback").textContent = text;
  }


  // ========================================
  // 4. ZOEKEN EN FILTEREN
  // ========================================

  function filteredMessages() {

    const query = $("cvSearch").value
      .trim()
      .toLocaleLowerCase("nl-NL");

    const status = $("cvStatusFilter").value;

    return state.berichten
      .filter(item => {

        const searchable = [
          item.naam,
          item.email,
          item.onderwerp,
          item.bericht
        ].join(" ").toLocaleLowerCase("nl-NL");

        return (
          (!query || searchable.includes(query)) &&
          (status === "all" || item.status === status)
        );

      })
      .sort((a, b) => {
        return (
          b.datum.localeCompare(a.datum) ||
          b.tijd.localeCompare(a.tijd)
        );
      });
  }


  // ========================================
  // 5. STATISTIEKEN
  // ========================================

  function renderStatistics() {

    const total = state.berichten.length;

    const answered = state.berichten.filter(
      item => item.status === "Beantwoord"
    ).length;

    $("cvTotal").textContent =
      String(total);

    $("cvOpen").textContent =
      String(total - answered);

    $("cvAnswered").textContent =
      String(answered);
  }


  // ========================================
  // 6. INBOX TONEN
  // ========================================

  function renderInbox() {

    const visible = filteredMessages();

    // Selectie aanpassen als het bericht
    // niet meer bij het filter past.
    if (
      !visible.some(item => item.id === selectedId)
    ) {
      selectedId = visible[0]?.id || null;
    }

    const list = $("cvMessageList");

    list.replaceChildren();

    $("cvResultCount").textContent =
      visible.length +
      (visible.length === 1
        ? " bericht"
        : " berichten");


    if (visible.length === 0) {

      list.appendChild(
        create(
          "p",
          "cv-empty",
          "Geen berichten gevonden. " +
          "Pas je zoekopdracht of statusfilter aan."
        )
      );

      return;
    }


    visible.forEach(item => {

      const button = create(
        "button",
        "cv-message-item"
      );

      button.type = "button";
      button.dataset.id = item.id;

      const active = item.id === selectedId;

      button.classList.toggle(
        "is-selected",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

      button.setAttribute(
        "aria-label",
        "Bekijk bericht: " + item.onderwerp +
        " van " + item.naam
      );


      const top = create(
        "div",
        "cv-message-top"
      );

      const badge = create(
        "span",
        badgeClass(item.status),
        item.status
      );

      const date = create(
        "span",
        "cv-message-date",
        formatDate(item.datum)
      );

      top.append(badge, date);


      button.appendChild(top);

      button.appendChild(
        create(
          "strong",
          "cv-message-subject",
          item.onderwerp
        )
      );

      button.appendChild(
        create(
          "span",
          "cv-message-name",
          item.naam
        )
      );

      button.appendChild(
        create(
          "p",
          "cv-message-preview",
          item.bericht
        )
      );

      list.appendChild(button);
    });
  }


  // ========================================
  // 7. BERICHTDETAILS TONEN
  // ========================================

  function renderDetails() {

    const item = selectedMessage();

    $("cvNoSelection").hidden = Boolean(item);
    $("cvSelectedMessage").hidden = !item;

    if (!item) {
      return;
    }

    $("cvDetailTitle").textContent =
      item.onderwerp;

    $("cvDetailName").textContent =
      item.naam;

    $("cvDetailEmail").textContent =
      item.email;

    $("cvDetailDate").textContent =
      formatDate(item.datum) +
      (item.tijd ? " · " + item.tijd : "");

    $("cvDetailMessage").textContent =
      item.bericht;

    $("cvAvatar").textContent =
      item.naam.trim().charAt(0).toUpperCase() || "?";

    const badge = $("cvDetailBadge");

    badge.className = badgeClass(item.status);
    badge.textContent = item.status;

    $("cvDetailStatus").value = item.status;

    const draft = state.concepten[item.id] || "";

    $("cvReply").value = draft;

    $("cvDraftStatus").textContent = draft
      ? "Concept lokaal opgeslagen"
      : "Nog geen concept";

    $("cvMessageSource").textContent =
      item.lokaal
        ? "Zelf toegevoegd demobericht"
        : "Oorspronkelijk voorbeeldbericht";

    $("cvDelete").hidden = !item.lokaal;
  }


  function render() {
    renderStatistics();
    renderInbox();
    renderDetails();
  }


  // ========================================
  // 8. BERICHT SELECTEREN
  // ========================================

  $("cvMessageList").addEventListener(
    "click",
    event => {

      const button = event.target.closest(
        "button[data-id]"
      );

      if (!button) return;

      selectedId = button.dataset.id;

      notify("");
      render();
    }
  );


  // ========================================
  // 9. FILTERS
  // ========================================

  $("cvSearch").addEventListener(
    "input",
    render
  );

  $("cvStatusFilter").addEventListener(
    "change",
    render
  );

  $("cvFilters").addEventListener(
    "submit",
    event => event.preventDefault()
  );

  $("cvFilters").addEventListener(
    "reset",
    () => {

      // De browser herstelt eerst de velden.
      setTimeout(() => render(), 0);
    }
  );


  // ========================================
  // 10. STATUS WIJZIGEN
  // ========================================

  $("cvDetailStatus").addEventListener(
    "change",
    event => {

      const item = selectedMessage();

      if (!item) return;

      const newStatus = event.target.value;

      if (!STATUSES.includes(newStatus)) return;

      const previousStatus = item.status;

      item.status = newStatus;

      if (!saveState()) {

        item.status = previousStatus;
        render();

        notify(
          "De status kon niet lokaal worden opgeslagen."
        );

        return;
      }

      render();

      notify(
        "Status gewijzigd naar " + newStatus +
        ". Dit is alleen lokaal opgeslagen."
      );
    }
  );


  // ========================================
  // 11. CONCEPT OPSLAAN
  // ========================================

  function saveCurrentDraft(showFeedback = true) {

    const item = selectedMessage();

    if (!item) return false;

    const text = $("cvReply").value.slice(0, 3000);

    const previous = state.concepten[item.id];

    if (text.trim()) {
      state.concepten[item.id] = text;
    } else {
      delete state.concepten[item.id];
    }

    if (!saveState()) {

      if (previous === undefined) {
        delete state.concepten[item.id];
      } else {
        state.concepten[item.id] = previous;
      }

      $("cvDraftStatus").textContent =
        "Opslaan mislukt";

      if (showFeedback) {
        notify(
          "Het concept kon niet worden opgeslagen."
        );
      }

      return false;
    }

    $("cvDraftStatus").textContent = text.trim()
      ? "Concept lokaal opgeslagen"
      : "Geen concept opgeslagen";

    if (showFeedback) {
      notify(
        "Concept opgeslagen in deze browser. " +
        "Er is geen e-mail verzonden."
      );
    }

    return true;
  }


  $("cvReply").addEventListener("input", () => {
    $("cvDraftStatus").textContent =
      "Niet-opgeslagen wijzigingen";
  });


  $("cvSaveDraft").addEventListener("click", () => {
    saveCurrentDraft();
  });


  // Bij wisselen van bericht eerst het
  // huidige concept automatisch bewaren.
  $("cvMessageList").addEventListener(
    "pointerdown",
    event => {

      const button = event.target.closest(
        "button[data-id]"
      );

      if (
        button &&
        button.dataset.id !== selectedId
      ) {
        saveCurrentDraft(false);
      }
    }
  );


  // ========================================
  // 12. ANTWOORD KOPIËREN
  // ========================================

  $("cvCopyReply").addEventListener(
    "click",
    async () => {

      const text = $("cvReply").value.trim();

      if (!text) {
        notify("Schrijf eerst een antwoord.");
        return;
      }

      saveCurrentDraft(false);

      try {

        if (!navigator.clipboard?.writeText) {
          throw new Error(
            "Klembord niet beschikbaar."
          );
        }

        await navigator.clipboard.writeText(text);

        notify(
          "Antwoord gekopieerd naar het klembord."
        );

      } catch (error) {

        notify(
          "Kopiëren lukt niet automatisch. " +
          "Selecteer de tekst en gebruik Command + C."
        );
      }
    }
  );


  // ========================================
  // 13. ANTWOORD OPENEN IN E-MAILAPP
  // ========================================

  $("cvEmailReply").addEventListener(
    "click",
    () => {

      const item = selectedMessage();

      if (!item) return;

      const reply = $("cvReply").value.trim();

      if (!reply) {
        notify("Schrijf eerst een antwoord.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        item.email
      )) {
        notify(
          "Dit bericht heeft geen geldig e-mailadres."
        );
        return;
      }

      saveCurrentDraft(false);

      const subject = "Re: " + item.onderwerp;

      const url =
        "mailto:" + item.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(reply);

      notify(
        "De e-mailapp wordt geopend. " +
        "Het bericht is nog niet verzonden."
      );

      window.location.href = url;
    }
  );


  // ========================================
  // 14. DEMOBERICHT TOEVOEGEN
  // ========================================

  const dialog = $("cvDialog");
  const newForm = $("cvNewForm");

  function closeDialog() {
    dialog.close();
  }


  $("cvAdd").addEventListener("click", () => {
    newForm.reset();
    dialog.showModal();
    $("cvNewName").focus();
  });


  $("cvCloseDialog").addEventListener(
    "click",
    closeDialog
  );

  $("cvCancelDialog").addEventListener(
    "click",
    closeDialog
  );


  newForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!newForm.reportValidity()) return;

    const name = $("cvNewName").value.trim();
    const email = $("cvNewEmail").value.trim();
    const subject = $("cvNewSubject").value.trim();
    const body = $("cvNewMessage").value.trim();

    if (!name || !email || !subject || !body) {
      return;
    }

    const item = {
      id: createId(),
      naam: name,
      email: email,
      onderwerp: subject,
      bericht: body,
      datum: currentDate(),
      tijd: currentTime(),
      status: "Open",
      lokaal: true
    };

    state.berichten.unshift(item);

    if (!saveState()) {

      state.berichten.shift();

      notify(
        "Het nieuwe bericht kon niet lokaal " +
        "worden opgeslagen."
      );

      closeDialog();
      return;
    }

    $("cvSearch").value = "";
    $("cvStatusFilter").value = "all";

    selectedId = item.id;

    closeDialog();
    render();

    notify(
      "Demobericht toegevoegd. " +
      "Het is niet vanuit het publieke " +
      "contactformulier ontvangen."
    );
  });


  // ========================================
  // 15. DEMOBERICHT VERWIJDEREN
  // ========================================

  $("cvDelete").addEventListener(
    "click",
    () => {

      const item = selectedMessage();

      if (!item || !item.lokaal) return;

      const confirmed = window.confirm(
        'Wil je "' + item.onderwerp +
        '" verwijderen uit deze frontenddemo?'
      );

      if (!confirmed) return;

      const oldState = JSON.parse(
        JSON.stringify(state)
      );

      state.berichten = state.berichten.filter(
        message => message.id !== item.id
      );

      delete state.concepten[item.id];

      if (!saveState()) {

        state = oldState;

        notify(
          "Verwijderen kon niet lokaal " +
          "worden opgeslagen."
        );

        return;
      }

      selectedId = null;

      render();

      notify("Demobericht lokaal verwijderd.");
    }
  );


  // ========================================
  // 16. ANDER BROWSERTABBLAD
  // ========================================

  window.addEventListener(
    "storage",
    event => {

      if (event.key !== STORAGE_KEY) return;

      state = loadState();
      render();

      notify(
        "Contactvragen bijgewerkt vanuit " +
        "een ander browsertabblad."
      );
    }
  );


  // ========================================
  // 17. START
  // ========================================

  render();

});
