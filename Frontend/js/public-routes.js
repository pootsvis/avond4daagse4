
// ==========================================
// AVOND4DAAGSE 2027
// PUBLIEKE ROUTES EN GPX-KAART
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = "http://localhost:5278";

    const $ = id => document.getElementById(id);

    const routeList = document.querySelector(".pp-route-list");

    const routeCount = $("ppRouteCount");
    const distanceFilter = $("ppDistanceFilter");
    const dayFilter = $("ppDayFilter");
    const mapStatus = $("ppMapStatus");

    if (!routeList || !routeCount || !distanceFilter) {
        return;
    }

    let routes = [];
    let map = null;
    let routeLayer = null;
    let locationMarker = null;
    let selectedRouteId = null;

    const startView = [52.1326, 5.2913];

    // ======================================
    // 1. HULPFUNCTIES
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

    function validPoints(points) {

        if (!Array.isArray(points)) {
            return [];
        }

        if (points.length < 2 || points.length > 5000) {
            return [];
        }

        const valid = points.every(point =>
            Array.isArray(point) &&
            point.length === 2 &&
            Number.isFinite(point[0]) &&
            Number.isFinite(point[1]) &&
            Math.abs(point[0]) <= 90 &&
            Math.abs(point[1]) <= 180
        );

        return valid ? points : [];
    }

    function eveningLabel(route) {

        return [1, 2, 3, 4].includes(
            Number(route.wandelavond)
        )
            ? "Avond " + route.wandelavond
            : "Wandelavond nog onbekend";
    }

    function isTestRoute(route) {

        return /test|demo/i.test(
            route.naam + " " +
            (route.evenementNaam || "")
        );
    }

    function setMapStatus(message) {

        if (mapStatus) {
            mapStatus.textContent = message;
        }
    }

    // ======================================
    // 2. BESTAANDE VOORBEELDROUTES WISSEN
    // ======================================

    routeList.querySelectorAll(
        ".pp-route-card"
    ).forEach(card => card.remove());

    const notice = routeList.querySelector(
        ".pp-notice"
    );

    if (notice) {

        notice.querySelector("strong").textContent =
            "Voorlopige routeinformatie";

        notice.querySelector("p").textContent =
            "De organisatie moet de officiële routes " +
            "en evenementdatums nog bevestigen. " +
            "Testroutes zijn geen officiële wandelroutes.";
    }

    const introduction = document.querySelector(
        "#routes-overzicht .pp-shell > div .pp-muted"
    );

    if (introduction) {

        introduction.textContent =
            "Kies een wandelavond en afstand. " +
            "Bekijk de beschikbare routegegevens " +
            "op de interactieve kaart.";
    }

    const caption = document.querySelector(
        ".pp-map-caption"
    );

    if (caption) {

        caption.textContent =
            "Kaartgegevens van OpenStreetMap. " +
            "Routepunten worden opgehaald uit de database. " +
            "De kaart geeft geen automatische wandelinstructies.";
    }

    // ======================================
    // 3. WANDELAVONDFILTER
    // ======================================

    if (dayFilter) {

        dayFilter.replaceChildren(
            new Option("Alle avonden", "all"),
            new Option("Avond 1", "1"),
            new Option("Avond 2", "2"),
            new Option("Avond 3", "3"),
            new Option("Avond 4", "4"),
            new Option("Nog onbekend", "unknown")
        );

        dayFilter.disabled = false;
    }

    // ======================================
    // 4. LEAFLET KAART
    // ======================================

    function initializeMap() {

        if (typeof window.L === "undefined") {

            setMapStatus(
                "De kaartbibliotheek kon niet laden."
            );

            return;
        }

        map = L.map("ppMap", {
            scrollWheelZoom: false
        }).setView(startView, 8);

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">' +
                    'OpenStreetMap</a> contributors'
            }
        ).addTo(map);

        routeLayer = L.layerGroup().addTo(map);

        setMapStatus(
            "Selecteer een route om het wandeltraject te bekijken."
        );

        setTimeout(() => map.invalidateSize(), 150);
    }

    initializeMap();

    // ======================================
    // 5. ROUTE TONEN OP KAART
    // ======================================

    function showRoute(route) {

        selectedRouteId = route.routeId;

        if (!map || !routeLayer) {

            setMapStatus(
                "De interactieve kaart is niet beschikbaar."
            );

            return;
        }

        routeLayer.clearLayers();

        const points = validPoints(route.gpxPunten);

        if (!points.length) {

            map.setView(startView, 8);

            setMapStatus(
                route.naam +
                ": er zijn nog geen GPX-routepunten beschikbaar."
            );

            return;
        }

        const line = L.polyline(points, {
            color: "#24694b",
            weight: 5,
            opacity: 0.9
        }).addTo(routeLayer);

        const startMarker = L.circleMarker(points[0], {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: "#e99b45",
            fillOpacity: 1
        }).addTo(routeLayer);

        const startPopup = element(
            "span",
            "",
            "Start: " +
            (route.startlocatie || "GPX-startpunt")
        );

        startMarker.bindPopup(startPopup);

        const endMarker = L.circleMarker(
            points[points.length - 1],
            {
                radius: 6,
                color: "#ffffff",
                weight: 2,
                fillColor: "#24694b",
                fillOpacity: 1
            }
        ).addTo(routeLayer);

        endMarker.bindPopup("Eindpunt");

        map.invalidateSize();

        map.fitBounds(line.getBounds(), {
            padding: [35, 35],
            maxZoom: 17
        });

        setMapStatus(
            route.naam +
            " · " +
            eveningLabel(route) +
            " · " +
            route.afstand +
            " km (afstandscategorie)" +
            (
                isTestRoute(route)
                    ? " · Testroute, niet officieel."
                    : " · Voorlopige routeinformatie."
            )
        );

        routeList.querySelectorAll(
            ".pp-route-card"
        ).forEach(card => {

            const active =
                card.dataset.routeId ===
                String(selectedRouteId);

            card.style.outline =
                active ? "2px solid #24694b" : "";

            const button = card.querySelector(
                "[data-route-button]"
            );

            button?.setAttribute(
                "aria-pressed",
                String(active)
            );
        });
    }

    // ======================================
    // 6. GPX DOWNLOADEN
    // ======================================

    function downloadGpx(route) {

        const points = validPoints(route.gpxPunten);

        if (!points.length) {
            return;
        }

        const escapeXml = value =>
            String(value).replace(
                /[<>&"']/g,
                char => ({
                    "<": "&lt;",
                    ">": "&gt;",
                    "&": "&amp;",
                    '"': "&quot;",
                    "'": "&apos;"
                })[char]
            );

        const coordinates = points.map(point =>
            `<trkpt lat="${point[0]}" lon="${point[1]}"/>`
        ).join("\n");

        const content =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<gpx version="1.1" creator="Avond4daagse 2027" ` +
            `xmlns="http://www.topografix.com/GPX/1/1">\n` +
            `<trk><name>${escapeXml(route.naam)}</name>\n` +
            `<trkseg>\n${coordinates}\n</trkseg>\n` +
            `</trk></gpx>`;

        const blob = new Blob(
            [content],
            { type: "application/gpx+xml" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        const filename = String(route.naam || "route")
            .replace(/[^a-zA-Z0-9_-]+/g, "-");

        link.download = filename + ".gpx";

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    }

    // ======================================
    // 7. ROUTEKAART MAKEN
    // ======================================

    function createRouteCard(route) {

        const card = element(
            "article",
            "pp-card pp-route-card"
        );

        card.dataset.distance =
            String(route.afstand);

        card.dataset.routeId =
            String(route.routeId);

        const top = element(
            "div",
            "pp-route-top"
        );

        top.append(
            element("h3", "", route.naam),
            element(
                "span",
                "pp-chip",
                route.afstand + " KM"
            )
        );

        const startTime = route.starttijd
            ? route.starttijd.slice(0, 5)
            : "Nog onbekend";

        const points = validPoints(
            route.gpxPunten
        );

        card.append(
            top,

            element(
                "p",
                "pp-muted",
                eveningLabel(route) +
                " · Starttijd: " + startTime
            ),

            element(
                "p",
                "pp-muted",
                "Startlocatie: " +
                (route.startlocatie || "Nog onbekend")
            ),

            element(
                "p",
                "pp-muted",
                "Controlepost: " +
                (route.controlepost || "Nog onbekend")
            ),

            element(
                "span",
                "pp-chip",
                isTestRoute(route)
                    ? "Testroute – niet officieel"
                    : "Voorlopige routeinformatie"
            ),

            element(
                "span",
                "pp-chip",
                points.length
                    ? "GPX beschikbaar"
                    : "GPX volgt later"
            )
        );

        const mapButton = element(
            "button",
            "pp-btn pp-btn--dark",
            points.length
                ? "Bekijk de route →"
                : "Bekijk de kaart →"
        );

        mapButton.type = "button";
        mapButton.dataset.routeButton = "true";

        mapButton.addEventListener("click", () => {

            showRoute(route);

            $("echte-kaart").scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });

        card.appendChild(mapButton);

        if (points.length) {

            const downloadButton = element(
                "button",
                "pp-btn pp-btn--light",
                "Download GPX ↓"
            );

            downloadButton.type = "button";

            downloadButton.addEventListener(
                "click",
                () => downloadGpx(route)
            );

            card.appendChild(downloadButton);
        }

        return card;
    }

    // ======================================
    // 8. ROUTES FILTEREN
    // ======================================

    function renderRoutes() {

        routeList.querySelectorAll(
            ".pp-route-card, .pp-route-empty"
        ).forEach(node => node.remove());

        const distance = distanceFilter.value;

        const evening = dayFilter?.value || "all";

        const filtered = routes.filter(route => {

            const matchesDistance =
                distance === "all" ||
                Number(route.afstand) === Number(distance);

            const knownEvening =
                [1, 2, 3, 4].includes(
                    Number(route.wandelavond)
                );

            const matchesEvening =
                evening === "all" ||
                (
                    evening === "unknown"
                        ? !knownEvening
                        : Number(route.wandelavond) ===
                          Number(evening)
                );

            return matchesDistance && matchesEvening;
        });

        filtered.forEach(route => {

            routeList.insertBefore(
                createRouteCard(route),
                notice
            );
        });

        if (!filtered.length) {

            routeList.insertBefore(
                element(
                    "p",
                    "pp-muted pp-route-empty",
                    "Geen routes gevonden voor deze selectie."
                ),
                notice
            );

            selectedRouteId = null;

            routeLayer?.clearLayers();

            map?.setView(startView, 8);

            setMapStatus(
                "Geen route beschikbaar voor deze filters."
            );

        } else {

            const selected = filtered.find(route =>
                route.routeId === selectedRouteId
            );

            const firstWithGpx = filtered.find(route =>
                validPoints(route.gpxPunten).length > 0
            );

            showRoute(
                selected ||
                firstWithGpx ||
                filtered[0]
            );
        }

        routeCount.textContent =
            filtered.length +
            " route(s) gevonden voor Avond4daagse 2027.";
    }

    distanceFilter.addEventListener(
        "change",
        renderRoutes
    );

    dayFilter?.addEventListener(
        "change",
        renderRoutes
    );

    // ======================================
    // 9. KAART RESETTEN
    // ======================================

    $("ppMapReset")?.addEventListener("click", () => {

        if (!map) return;

        map.setView(startView, 8);

        setMapStatus(
            "Nederland in beeld. Selecteer een route om in te zoomen."
        );
    });

    // ======================================
    // 10. EIGEN LOCATIE
    // ======================================

    $("ppLocate")?.addEventListener("click", () => {

        if (!map) return;

        if (!navigator.geolocation) {

            setMapStatus(
                "Je browser ondersteunt geen locatiebepaling."
            );

            return;
        }

        setMapStatus(
            "Je locatie wordt opgezocht..."
        );

        navigator.geolocation.getCurrentPosition(

            position => {

                const coordinates = [
                    position.coords.latitude,
                    position.coords.longitude
                ];

                if (locationMarker) {

                    map.removeLayer(locationMarker);
                }

                locationMarker = L.marker(
                    coordinates
                ).addTo(map);

                locationMarker
                    .bindPopup("Jouw huidige locatie")
                    .openPopup();

                map.setView(coordinates, 14);

                setMapStatus(
                    "Je locatie staat op de kaart. " +
                    "Dit is geen officieel startpunt."
                );
            },

            () => {

                setMapStatus(
                    "Locatietoegang is geweigerd of niet beschikbaar."
                );
            },

            {
                enableHighAccuracy: false,
                timeout: 10000
            }
        );
    });

    // ======================================
    // 11. ROUTES UIT DATABASE OPHALEN
    // ======================================

    routeCount.textContent =
        "Routes worden opgehaald...";

    try {

        const [routeResponse, eventResponse] =
            await Promise.all([

                fetch(
                    API_URL + "/api/Route",
                    { cache: "no-store" }
                ),

                fetch(
                    API_URL + "/api/Evenement",
                    { cache: "no-store" }
                )
            ]);

        if (!routeResponse.ok || !eventResponse.ok) {

            throw new Error(
                "Routegegevens konden niet worden opgehaald."
            );
        }

        const allRoutes =
            await routeResponse.json();

        const evenementen =
            await eventResponse.json();

        if (
            !Array.isArray(allRoutes) ||
            !Array.isArray(evenementen)
        ) {

            throw new Error(
                "Onverwacht antwoord van de backend."
            );
        }

        const events2027 = new Map(

            evenementen
                .filter(event =>
                    typeof event.datum === "string" &&
                    event.datum.startsWith("2027-")
                )
                .map(event => [
                    event.evenementId,
                    event
                ])
        );

        routes = allRoutes
            .filter(route =>
                events2027.has(route.evenementId)
            )
            .map(route => ({
                ...route,

                evenementNaam:
                    events2027.get(route.evenementId)?.naam ||
                    route.evenementNaam ||
                    ""
            }));

        renderRoutes();

    } catch (error) {

        console.error(
            "Routes ophalen mislukt:",
            error
        );

        routeCount.textContent =
            "Routes konden niet worden geladen. " +
            "Probeer het later opnieuw.";

        setMapStatus(
            "Routegegevens zijn momenteel niet beschikbaar."
        );
    }

});
