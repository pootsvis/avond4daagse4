
// ==========================================
// AVOND4DAAGSE 2027
// MIJN BESCHIKBAARHEID - FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const STORAGE_KEY =
    "avond4daagse-beschikbaarheid-v2";

  const OLD_STORAGE_KEY =
    "avond4daagse-beschikbaarheid-demo";

  const VALID_VALUES = [
    "beschikbaar",
    "misschien",
    "niet"
  ];

  const form = $("baForm");
  const note = $("baNote");
  const statusText = $("baSavedStatus");
  const feedback = $("baFeedback");
  const restoreButton = $("baRestore");

  const evenings = [
    ...document.querySelectorAll(".ba-evening")
  ];


  // ========================================
  // 1. LEGE BESCHIKBAARHEID
  // ========================================

  function emptyState() {

    return {
      avonden: {
        "1": "",
        "2": "",
        "3": "",
        "4": ""
      },
      toelichting: ""
    };
  }


  // ========================================
  // 2. GEGEVENS CONTROLEREN
  // ========================================

  function normalizeState(data) {

    const result = emptyState();

    if (!data || typeof data !== "object") {
      return result;
    }

    for (let number = 1; number <= 4; number++) {

      const value = data.avonden?.[String(number)];

      if (VALID_VALUES.includes(value)) {
        result.avonden[String(number)] = value;
      }
    }

    if (typeof data.toelichting === "string") {
      result.toelichting =
        data.toelichting.slice(0, 600);
    }

    return result;
  }


  // ========================================
  // 3. OUDE OPSLAG COMPATIBEL HOUDEN
  // ========================================

  function convertOldState(data) {

    const result = emptyState();

    if (!data || typeof data !== "object") {
      return result;
    }

    // Alleen voor het overzetten van de oude
    // lokaal opgeslagen demo-indeling.
    // De datums zijn geen bevestigde planning.

    const oldKeys = [
      "2027-06-01",
      "2027-06-02",
      "2027-06-03",
      "2027-06-04"
    ];

    oldKeys.forEach((key, index) => {

      const oldValue = data.avonden?.[key];

      if (oldValue === "ja") {
        result.avonden[String(index + 1)] =
          "beschikbaar";
      }

      if (oldValue === "nee") {
        result.avonden[String(index + 1)] =
          "niet";
      }

    });

    if (typeof data.toelichting === "string") {
      result.toelichting =
        data.toelichting.slice(0, 600);
    }

    return result;
  }


  // ========================================
  // 4. OPGESLAGEN KEUZES LADEN
  // ========================================

  function loadState() {

    try {

      const current = localStorage.getItem(
        STORAGE_KEY
      );

      if (current !== null) {

        const data = JSON.parse(current);

        return {
          state: normalizeState(data),
          source: "current"
        };
      }

      const old = localStorage.getItem(
        OLD_STORAGE_KEY
      );

      if (old !== null) {

        const data = JSON.parse(old);

        return {
          state: convertOldState(data),
          source: "old"
        };
      }

    } catch (error) {

      console.warn(
        "Beschikbaarheid kon niet geladen worden.",
        error
      );
    }

    return {
      state: emptyState(),
      source: "none"
    };
  }


  const loaded = loadState();

  let savedState = loaded.state;
  let savedSource = loaded.source;


  // ========================================
  // 5. KEUZES IN HET FORMULIER TONEN
  // ========================================

  function applyState(state) {

    evenings.forEach(card => {

      const number = card.dataset.evening;
      const value = state.avonden[number];

      const radios = card.querySelectorAll(
        'input[type="radio"]'
      );

      radios.forEach(radio => {

        radio.checked =
          radio.value === value;

      });
    });

    note.value = state.toelichting;

    updateView();
  }


  // ========================================
  // 6. HUIDIGE KEUZES UITLEZEN
  // ========================================

  function readState() {

    const state = emptyState();

    evenings.forEach(card => {

      const number = card.dataset.evening;

      const selected = card.querySelector(
        'input[type="radio"]:checked'
      );

      if (
        selected &&
        VALID_VALUES.includes(selected.value)
      ) {
        state.avonden[number] = selected.value;
      }
    });

    state.toelichting = note.value.slice(0, 600);

    return state;
  }


  // ========================================
  // 7. STATISTIEKEN EN VOORTGANG
  // ========================================

  function updateView() {

    const state = readState();

    const values = Object.values(
      state.avonden
    );

    const filled = values.filter(
      value => VALID_VALUES.includes(value)
    ).length;

    const available = values.filter(
      value => value === "beschikbaar"
    ).length;

    const maybe = values.filter(
      value => value === "misschien"
    ).length;

    const unavailable = values.filter(
      value => value === "niet"
    ).length;


    $("baFilled").textContent =
      filled + " / 4";

    $("baAvailable").textContent =
      String(available);

    $("baMaybe").textContent =
      String(maybe);

    $("baUnavailable").textContent =
      String(unavailable);


    // Voortgangsbalk
    $("baProgressLabel").textContent =
      filled + " van 4 ingevuld";

    $("baProgress").setAttribute(
      "aria-valuenow",
      String(filled)
    );

    $("baProgressFill").style.width =
      (filled / 4 * 100) + "%";


    // Tekenteller
    $("baNoteCount").textContent =
      note.value.length + " / 600 tekens";


    // Geselecteerde keuze per avond
    evenings.forEach(card => {

      const number = card.dataset.evening;
      const value = state.avonden[number];

      const status = card.querySelector(
        ".ba-evening-status"
      );

      const labels = {
        "": "Nog niet ingevuld",
        beschikbaar: "Je bent beschikbaar",
        misschien: "Beschikbaarheid onzeker",
        niet: "Je bent niet beschikbaar"
      };

      status.textContent =
        labels[value] || labels[""];


      card.querySelectorAll(
        ".ba-choice"
      ).forEach(label => {

        const radio = label.querySelector("input");

        const active = radio.checked;

        label.classList.toggle(
          "is-selected",
          active
        );

        label.classList.toggle(
          "is-maybe",
          active && radio.value === "misschien"
        );

        label.classList.toggle(
          "is-unavailable",
          active && radio.value === "niet"
        );
      });
    });


    // Zijn er wijzigingen sinds de
    // laatst geladen of opgeslagen keuzes?
    const changed =
      JSON.stringify(state) !==
      JSON.stringify(savedState);

    restoreButton.disabled = !changed;

    if (changed) {

      statusText.textContent =
        "Wijzigingen nog niet opgeslagen";

    } else if (savedSource === "current") {

      statusText.textContent =
        "Lokaal opgeslagen in deze browser";

    } else if (savedSource === "old") {

      statusText.textContent =
        "Eerdere lokaal opgeslagen keuzes geladen";

    } else {

      statusText.textContent =
        "Nog geen keuzes opgeslagen";
    }
  }


  // ========================================
  // 8. WIJZIGINGEN BIJHOUDEN
  // ========================================

  form.addEventListener("change", () => {

    feedback.textContent = "";
    updateView();

  });


  note.addEventListener("input", () => {

    feedback.textContent = "";
    updateView();

  });


  // ========================================
  // 9. LOKAAL OPSLAAN
  // ========================================

  form.addEventListener("submit", event => {

    event.preventDefault();

    const state = readState();

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

      savedState = state;
      savedSource = "current";

      updateView();

      const filled = Object.values(
        state.avonden
      ).filter(
        value => VALID_VALUES.includes(value)
      ).length;

      feedback.textContent =
        "Je keuzes voor " + filled +
        " van de 4 avonden zijn opgeslagen " +
        "in deze browser. Er is niets " +
        "naar de organisatie verzonden.";

    } catch (error) {

      console.warn(
        "Lokaal opslaan is mislukt.",
        error
      );

      feedback.textContent =
        "Opslaan is mislukt. Controleer of " +
        "je browser lokale opslag toestaat.";
    }
  });


  // ========================================
  // 10. LAATST OPGESLAGEN KEUZES HERSTELLEN
  // ========================================

  restoreButton.addEventListener("click", () => {

    applyState(savedState);

    feedback.textContent =
      savedSource === "none"
        ? "De nog niet opgeslagen keuzes zijn gewist."
        : "De laatst geladen of opgeslagen keuzes " +
          "zijn hersteld.";

  });


  // ========================================
  // 11. PAGINA INITIALISEREN
  // ========================================

  applyState(savedState);

});
