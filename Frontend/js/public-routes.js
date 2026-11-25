
document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================
  // AVOND4DAAGSE 2027
  // PUBLIEKE ROUTES UIT DE BACKEND
  // ==========================================

  const API_URL = "http://localhost:5278";

  const routeList = document.querySelector(
    ".pp-route-list"
  );

  const routeCount = document.getElementById(
    "ppRouteCount"
  );

  const distanceFilter = document.getElementById(
    "ppDistanceFilter"
  );

  const dayFilter = document.getElementById(
    "ppDayFilter"
  );

  if (!routeList || !routeCount || !distanceFilter) {
    return;
  }

  // ==========================================
  // 1. OUDE VOORBEELDROUTES WEGHALEN
  // ==========================================

  routeList.querySelectorAll(
    ".pp-route-card"
  ).forEach(card => card.remove());

  const notice = routeList.querySelector(
    ".pp-notice"
  );

  // De backend heeft nog geen datum per route.
  // Daarom schakelen we deze filter voorlopig uit.

  if (dayFilter) {
    dayFilter.disabled = true;
    dayFilter.innerHTML =
      '<option value="">Dagindeling volgt later</option>';
  }

  let routes = [];

  // ==========================================
  // 2. ROUTEKAART AANMAKEN
  // ==========================================

  function createRouteCard(route) {

    const card = document.createElement("article");
    card.className = "pp-card pp-route-card";
    card.dataset.distance = String(route.afstand);

    const top = document.createElement("div");
    top.className = "pp-route-top";

    const title = document.createElement("h3");
    title.textContent = route.naam;

    const chip = document.createElement("span");
    chip.className = "pp-chip";
    chip.textContent = route.afstand + " KM";

    top.appendChild(title);
    top.appendChild(chip);

    const description = document.createElement("p");
    description.className = "pp-muted";

    const starttijd = route.starttijd
      ? route.starttijd.slice(0, 5)
      : "Nog niet bekend";

    description.textContent =
      "Afstand: " + route.afstand + " km" +
      " · Starttijd: " + starttijd;

    const checkpoint = document.createElement("p");
    checkpoint.className = "pp-muted";

    checkpoint.textContent =
      "Controlepost: " +
      (route.controlepost || "Nog niet bekend");

    const info = document.createElement("span");
    info.className = "pp-chip";

    info.textContent =
      route.naam.toLowerCase().includes("test")
        ? "Testroute - niet officieel"
        : "Routegegevens uit database";

    const mapLink = document.createElement("a");
    mapLink.className = "pp-btn pp-btn--dark";
    mapLink.href = "#echte-kaart";
    mapLink.textContent = "Bekijk de kaart →";

    card.appendChild(top);
    card.appendChild(description);
    card.appendChild(checkpoint);
    card.appendChild(info);
    card.appendChild(mapLink);

    return card;
  }

  // ==========================================
  // 3. ROUTES EN AFSTAND FILTEREN
  // ==========================================

  function renderRoutes() {

    routeList.querySelectorAll(
      ".pp-route-card, .pp-route-empty"
    ).forEach(element => element.remove());

    const selectedDistance = distanceFilter.value;

    const filteredRoutes = routes.filter(route => {
      return (
        selectedDistance === "all" ||
        Number(route.afstand) === Number(selectedDistance)
      );
    });

    filteredRoutes.forEach(route => {

      const card = createRouteCard(route);

      routeList.insertBefore(
        card,
        notice
      );
    });

    if (filteredRoutes.length === 0) {

      const empty = document.createElement("p");
      empty.className = "pp-muted pp-route-empty";

      empty.textContent =
        "Er zijn nog geen routes voor " +
        "deze afstand beschikbaar.";

      routeList.insertBefore(empty, notice);
    }

    routeCount.textContent =
      filteredRoutes.length +
      " route(s) gevonden voor Avond4daagse 2027. " +
      "De officiële wandeltrajecten volgen later.";
  }

  distanceFilter.addEventListener(
    "change",
    renderRoutes
  );

  // ==========================================
  // 4. ROUTES UIT POSTGRESQL OPHALEN
  // ==========================================

  routeCount.textContent =
    "Routes worden opgehaald...";

  try {

    const [routeResponse, eventResponse] =
      await Promise.all([
        fetch(API_URL + "/api/Route"),
        fetch(API_URL + "/api/Evenement")
      ]);

    if (!routeResponse.ok || !eventResponse.ok) {
      throw new Error(
        "De routegegevens konden niet worden opgehaald."
      );
    }

    const allRoutes = await routeResponse.json();
    const evenementen = await eventResponse.json();

    // Alleen routes van evenementen in 2027 tonen.
    const eventIds = new Set(
      evenementen
        .filter(event =>
          typeof event.datum === "string" &&
          event.datum.startsWith("2027-")
        )
        .map(event => event.evenementId)
    );

    routes = allRoutes.filter(route =>
      eventIds.has(route.evenementId)
    );

    renderRoutes();

  } catch (error) {

    console.error(
      "Routes ophalen mislukt:",
      error
    );

    routeCount.textContent =
      "Routes konden niet worden geladen. " +
      "Controleer of de backend draait.";
  }

});
