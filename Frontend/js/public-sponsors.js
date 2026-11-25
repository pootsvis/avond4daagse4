
document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================
  // AVOND4DAAGSE 2027
  // SPONSOREN UIT DE DATABASE
  // ==========================================

  const API_URL = "http://localhost:5278";

  // Bestaande sponsoren van 2026 behouden.
  const historicalSection = document.getElementById(
    "partners"
  );

  if (!historicalSection) {
    return;
  }

  // ==========================================
  // 1. NIEUW DATABASEOVERZICHT MAKEN
  // ==========================================

  const section = document.createElement("section");
  section.className = "sp-partners";
  section.id = "database-sponsoren";

  const shell = document.createElement("div");
  shell.className = "pp-shell";

  const intro = document.createElement("div");
  intro.className = "sp-section-intro";

  const introText = document.createElement("div");

  const eyebrow = document.createElement("span");
  eyebrow.className = "sp-eyebrow";
  eyebrow.textContent = "SPONSOREN IN HET SYSTEEM";

  const heading = document.createElement("h2");
  heading.textContent = "Sponsoren uit onze database";

  const description = document.createElement("p");
  description.textContent =
    "Dit overzicht wordt rechtstreeks uit PostgreSQL " +
    "geladen. De gegevens kunnen nog testvermeldingen " +
    "bevatten. Officiele sponsoren voor 2027 moeten " +
    "nog door de organisatie bevestigd worden.";

  introText.appendChild(eyebrow);
  introText.appendChild(heading);
  introText.appendChild(description);

  const total = document.createElement("div");
  total.className = "sp-total";

  const totalNumber = document.createElement("strong");
  totalNumber.textContent = "0";

  const totalLabel = document.createElement("span");
  totalLabel.textContent = "vermeldingen";

  total.appendChild(totalNumber);
  total.appendChild(totalLabel);

  intro.appendChild(introText);
  intro.appendChild(total);

  // ==========================================
  // 2. GRID EN STATUS MAKEN
  // ==========================================

  const status = document.createElement("p");
  status.className = "pp-muted";
  status.setAttribute("role", "status");
  status.textContent = "Sponsoren worden opgehaald...";

  const grid = document.createElement("ul");
  grid.className = "sp-logo-grid";

  shell.appendChild(intro);
  shell.appendChild(status);
  shell.appendChild(grid);

  section.appendChild(shell);

  // Plaats boven het bestaande 2026-overzicht.
  historicalSection.before(section);

  // ==========================================
  // 3. SPONSORKAART MAKEN
  // ==========================================

  function createSponsorCard(sponsor) {

    const card = document.createElement("li");
    card.className = "sp-logo-card";

    const stage = document.createElement("div");
    stage.className = "sp-logo-stage";

    const stageLabel = document.createElement("span");
    stageLabel.className = "sp-eyebrow";
    stageLabel.textContent = "SPONSOR";

    stage.appendChild(stageLabel);

    const info = document.createElement("div");
    info.className = "sp-logo-info";

    const name = document.createElement("h3");
    name.textContent = sponsor.naam;

    info.appendChild(name);

    card.appendChild(stage);
    card.appendChild(info);

    return card;
  }

  // ==========================================
  // 4. SPONSOREN OPHALEN VIA DE API
  // ==========================================

  try {

    const response = await fetch(
      API_URL + "/api/Sponsor",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const sponsors = await response.json();

    if (!Array.isArray(sponsors)) {
      throw new Error("Ongeldige gegevens ontvangen.");
    }

    grid.replaceChildren();

    totalNumber.textContent = String(
      sponsors.length
    );

    if (sponsors.length === 0) {

      status.textContent =
        "Er staan nog geen sponsoren in de database.";

      return;
    }

    sponsors.forEach(sponsor => {

      if (
        !sponsor ||
        typeof sponsor.naam !== "string"
      ) {
        return;
      }

      grid.appendChild(
        createSponsorCard(sponsor)
      );
    });

    status.textContent =
      sponsors.length +
      " sponsorvermelding(en) geladen uit PostgreSQL.";

  } catch (error) {

    console.error(
      "Sponsoren ophalen mislukt:",
      error
    );

    status.textContent =
      "Sponsoren konden niet worden geladen. " +
      "Controleer of de backend actief is.";
  }

});
