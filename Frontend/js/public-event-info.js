
document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================
  // AVOND4DAAGSE 2027
  // PRAKTISCHE INFORMATIE UIT BACKEND
  // ==========================================

  const API_URL = "http://localhost:5278";

  const facts = document.querySelector(".pp-facts");

  if (!facts) {
    return;
  }

  // ==========================================
  // 1. INFORMATIEKAART MAKEN
  // ==========================================

  const card = document.createElement("article");
  card.className = "pp-card";

  card.style.marginTop = "30px";
  card.style.padding = "28px";

  const title = document.createElement("h3");
  title.textContent = "Evenementgegevens uit de database";

  const status = document.createElement("p");
  status.className = "pp-muted";
  status.textContent = "Evenementgegevens laden...";

  const details = document.createElement("div");
  details.style.marginTop = "20px";

  card.appendChild(title);
  card.appendChild(status);
  card.appendChild(details);

  facts.after(card);

  // ==========================================
  // 2. GEGEVENSREGEL MAKEN
  // ==========================================

  function addDetail(label, value) {

    const row = document.createElement("p");
    row.style.marginBottom = "12px";

    const strong = document.createElement("strong");
    strong.textContent = label + ": ";

    const text = document.createElement("span");
    text.textContent = value || "Nog niet bekend";

    row.appendChild(strong);
    row.appendChild(text);

    details.appendChild(row);
  }

  // ==========================================
  // 3. DATUM NETJES TONEN
  // ==========================================

  function formatDate(value) {

    if (!value) {
      return "Nog niet bekend";
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    return parts[2] + "-" + parts[1] + "-" + parts[0];
  }

  // ==========================================
  // 4. EVENEMENT OPHALEN
  // ==========================================

  try {

    const response = await fetch(
      API_URL + "/api/Evenement",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const evenementen = await response.json();

    if (!Array.isArray(evenementen)) {
      throw new Error("Ongeldige evenementgegevens.");
    }

    // Alleen evenementen uit 2027.
    const events2027 = evenementen.filter(event =>
      typeof event.datum === "string" &&
      event.datum.startsWith("2027-")
    );

    if (events2027.length === 0) {

      status.textContent =
        "Er staan nog geen evenementen voor 2027 " +
        "in de database.";

      return;
    }

    // Gepubliceerde evenementen krijgen voorrang.
    const evenement =
      events2027.find(event =>
        event.publicatiestatus?.toLowerCase() ===
        "gepubliceerd"
      ) || events2027[0];

    const isTest =
      evenement.naam.toLowerCase().includes("test") ||
      evenement.publicatiestatus?.toLowerCase() !==
      "gepubliceerd";

    details.replaceChildren();

    // ========================================
    // 5. PUBLICATIESTATUS CONTROLEREN
    // ========================================

    if (isTest) {

      status.textContent =
        "Let op: dit zijn concept- of testgegevens. " +
        "De organisatie heeft deze informatie " +
        "nog niet officieel gepubliceerd.";

    } else {

      status.textContent =
        "Deze gegevens komen uit de database " +
        "van de Avond4daagse.";
    }

    // ========================================
    // 6. EVENEMENTGEGEVENS TONEN
    // ========================================

    addDetail("Evenement", evenement.naam);

    addDetail(
      "Datum",
      formatDate(evenement.datum)
    );

    addDetail("Locatie", evenement.locatie);

    const tijd = evenement.inzetSchema?.tijd;

    addDetail(
      "Tijd uit inzetschema",
      tijd ? tijd.slice(0, 5) : "Nog niet bekend"
    );

    addDetail(
      "Publicatiestatus",
      evenement.publicatiestatus
    );

    addDetail(
      "Bereikbaarheid",
      evenement.praktischeInformatie?.bereikbaarheid
    );

    addDetail(
      "Deelnemersinformatie",
      evenement.praktischeInformatie?.deelnemersinformatie
    );

  } catch (error) {

    console.error(
      "Evenementinformatie ophalen mislukt:",
      error
    );

    status.textContent =
      "Evenementgegevens konden niet worden geladen. " +
      "Controleer of de backend actief is.";
  }

});
